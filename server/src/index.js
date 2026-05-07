import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { newId, nowIso, readDb, writeDb } from './db.js'
import { normalizeEmail, sanitizeText } from './security.js'

const app = express()
const PORT = Number(process.env.PORT) || 3001
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production'
const JWT_EXPIRY = '7d'
const REFRESH_TOKEN_EXPIRY = '30d'

app.use(cors())
app.use(express.json())

// Middleware: JWT token validálás
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Nincs token a kérésben.' })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Érvénytelen token.' })
    }
    req.user = user
    next()
  })
}

// Middleware: csak admin hozzáférés
function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Csak adminisztrátorok férhetnek hozzá.' })
  }
  next()
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, timestamp: nowIso() })
})

// === AUTH ENDPOINTOK ===

app.post('/api/auth/register', async (req, res) => {
  const { email, password, fullName, role = 'jobseeker' } = req.body
  const normalizedEmail = normalizeEmail(email)
  const safeFullName = sanitizeText(fullName)

  // Validáció
  if (!normalizedEmail || !password || !safeFullName) {
    return res.status(400).json({ message: 'Az email, jelszó és teljes név kötelezőek.' })
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'A jelszó minimum 6 karakter hosszú kell, hogy legyen.' })
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return res.status(400).json({ message: 'Érvénytelen e-mail cím.' })
  }

  const db = await readDb()

  // Email létezik-e már?
  if (db.users.some((u) => normalizeEmail(u.email) === normalizedEmail)) {
    return res.status(409).json({ message: 'Ez az e-mail cím már regisztrálva van.' })
  }

  // Jelszó hash-elés
  const hashedPassword = await bcrypt.hash(password, 10)

  const newUser = {
    id: newId('u'),
    email: normalizedEmail,
    fullName: safeFullName,
    role,
    isActive: true,
    passwordHash: hashedPassword,
    createdAt: nowIso(),
    updatedAt: nowIso()
  }

  db.users.push(newUser)
  await writeDb(db)

  // Token generálás
  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, role: newUser.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  )

  return res.status(201).json({
    token,
    user: {
      id: newUser.id,
      email: newUser.email,
      fullName: newUser.fullName,
      role: newUser.role
    }
  })
})

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body
  const normalizedEmail = normalizeEmail(email)

  if (!normalizedEmail || !password) {
    return res.status(400).json({ message: 'Az email és jelszó kötelezőek.' })
  }

  const db = await readDb()
  const user = db.users.find((u) => normalizeEmail(u.email) === normalizedEmail)

  if (!user) {
    return res.status(401).json({ message: 'Helytelen email vagy jelszó.' })
  }

  // Jelszó ellenőrzés
  const passwordMatch = await bcrypt.compare(password, user.passwordHash)
  if (!passwordMatch) {
    return res.status(401).json({ message: 'Helytelen email vagy jelszó.' })
  }

  if (!user.isActive) {
    return res.status(403).json({ message: 'Ez a felhasználó inaktív.' })
  }

  // Token generálás
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  )

  return res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role
    }
  })
})

app.post('/api/auth/logout', (_req, res) => {
  // A logout a frontend-en történik (token törlés)
  // Backend: csak 200 OK válasz
  return res.json({ message: 'Sikeresen kijelentkezve.' })
})

// === VÉGPONT VÉDELEM ===

app.get('/api/categories', async (_req, res) => {
  const db = await readDb()
  res.json(db.categories)
})

app.get('/api/skills', async (_req, res) => {
  const db = await readDb()
  res.json(db.skills)
})

app.get('/api/companies', async (_req, res) => {
  const db = await readDb()
  res.json(db.companies)
})

app.get('/api/users', authenticateToken, requireAdmin, async (_req, res) => {
  const db = await readDb()
  res.json(db.users)
})

app.put('/api/users/:id/active', authenticateToken, requireAdmin, async (req, res) => {
  const { isActive } = req.body

  if (typeof isActive !== 'boolean') {
    return res.status(400).json({ message: 'Az isActive mező kötelező és boolean típusú.' })
  }

  const db = await readDb()
  const user = db.users.find((item) => item.id === req.params.id)

  if (!user) {
    return res.status(404).json({ message: 'A felhasználó nem található.' })
  }

  user.isActive = isActive
  user.updatedAt = nowIso()

  await writeDb(db)
  return res.json(user)
})

app.post('/api/companies', authenticateToken, async (req, res) => {
  const { ownerUserId, name, description = '', websiteUrl = '', location = '' } = req.body
  const safeName = sanitizeText(name)
  const safeDescription = sanitizeText(description)
  const safeWebsiteUrl = sanitizeText(websiteUrl)
  const safeLocation = sanitizeText(location)

  if (!ownerUserId || !safeName || !safeLocation) {
    return res.status(400).json({ message: 'A cég létrehozásához ownerUserId, name és location kötelező.' })
  }

  // Csak a saját céget hozhatja létre
  if (ownerUserId !== req.user.id) {
    return res.status(403).json({ message: 'Csak a saját cégedet hozhatod létre.' })
  }

  const db = await readDb()
  const createdAt = nowIso()
  const company = {
    id: newId('comp'),
    ownerUserId,
    name: safeName,
    description: safeDescription,
    websiteUrl: safeWebsiteUrl,
    location: safeLocation,
    createdAt,
    updatedAt: createdAt
  }

  db.companies.push(company)
  await writeDb(db)
  return res.status(201).json(company)
})

app.put('/api/companies/:id', authenticateToken, async (req, res) => {
  const db = await readDb()
  const company = db.companies.find((item) => item.id === req.params.id)

  if (!company) {
    return res.status(404).json({ message: 'A cég nem található.' })
  }

  // Csak a tulajdonos szerkesztheti
  if (company.ownerUserId !== req.user.id) {
    return res.status(403).json({ message: 'Csak a saját cégedet szerkesztheted.' })
  }

  const next = req.body
  company.name = next.name ? sanitizeText(next.name) : company.name
  company.description = next.description ? sanitizeText(next.description) : company.description
  company.websiteUrl = next.websiteUrl ? sanitizeText(next.websiteUrl) : company.websiteUrl
  company.location = next.location ? sanitizeText(next.location) : company.location
  company.updatedAt = nowIso()

  await writeDb(db)
  return res.json(company)
})

app.delete('/api/companies/:id', authenticateToken, async (req, res) => {
  const db = await readDb()
  const index = db.companies.findIndex((item) => item.id === req.params.id)

  if (index === -1) {
    return res.status(404).json({ message: 'A cég nem található.' })
  }

  // Csak a tulajdonos törölheti
  if (db.companies[index].ownerUserId !== req.user.id) {
    return res.status(403).json({ message: 'Csak a saját cégedet törölheted.' })
  }

  const companyId = db.companies[index].id
  const hasJobs = db.jobs.some((job) => job.companyId === companyId)

  if (hasJobs) {
    return res.status(409).json({ message: 'A céghez tartozik aktív álláshirdetés, előbb töröld vagy szerkeszd az állásokat.' })
  }

  db.companies.splice(index, 1)
  await writeDb(db)
  return res.status(204).send()
})

function enrichJob(job, db) {
  const company = db.companies.find((item) => item.id === job.companyId)
  const category = db.categories.find((item) => item.id === job.categoryId)

  return {
    ...job,
    companyName: company?.name ?? 'Ismeretlen cég',
    categoryName: category?.name ?? 'Nincs kategória'
  }
}

app.get('/api/jobs', async (req, res) => {
  const db = await readDb()
  let list = db.jobs.map((job) => enrichJob(job, db))

  const q = typeof req.query.q === 'string' ? req.query.q.trim().toLowerCase() : ''
  const categoryId = typeof req.query.categoryId === 'string' ? req.query.categoryId : ''
  const workMode = typeof req.query.workMode === 'string' ? req.query.workMode : ''
  const sortBy = typeof req.query.sortBy === 'string' ? req.query.sortBy : 'newest'

  if (q) {
    list = list.filter((job) => {
      const haystack = `${job.title} ${job.description} ${job.companyName} ${job.city}`.toLowerCase()
      return haystack.includes(q)
    })
  }

  if (categoryId) {
    list = list.filter((job) => job.categoryId === categoryId)
  }

  if (workMode) {
    list = list.filter((job) => job.workMode === workMode)
  }

  if (sortBy === 'salary-desc') {
    list.sort((a, b) => b.salaryMax - a.salaryMax)
  } else if (sortBy === 'salary-asc') {
    list.sort((a, b) => a.salaryMin - b.salaryMin)
  } else {
    list.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
  }

  res.json(list)
})

app.get('/api/jobs/:id', async (req, res) => {
  const db = await readDb()
  const job = db.jobs.find((item) => item.id === req.params.id)

  if (!job) {
    return res.status(404).json({ message: 'Az álláshirdetés nem található.' })
  }

  return res.json(enrichJob(job, db))
})

app.post('/api/jobs', authenticateToken, async (req, res) => {
  const {
    companyId,
    categoryId,
    title,
    description,
    employmentType,
    workMode,
    city,
    salaryMin,
    salaryMax,
    currency = 'HUF',
    status = 'published',
    expiresAt,
    skillIds = []
  } = req.body

  if (!companyId || !categoryId || !title || !description || !employmentType || !workMode || !city) {
    return res.status(400).json({ message: 'Hiányzó kötelező mezők az álláshirdetés létrehozásához.' })
  }

  const db = await readDb()
  const company = db.companies.find((item) => item.id === companyId)
  const category = db.categories.find((item) => item.id === categoryId)
  const safeTitle = sanitizeText(title)
  const safeDescription = sanitizeText(description)
  const safeCity = sanitizeText(city)

  if (!company || !category) {
    return res.status(400).json({ message: 'Érvénytelen companyId vagy categoryId.' })
  }

  // Csak a cég tulajdonosa vagy admin hozhat létre álláshirdetést
  if (company.ownerUserId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Ehhez a céghez nincs jogod álláshirdetést létrehozni.' })
  }

  const createdAt = nowIso()

  const job = {
    id: newId('job'),
    companyId,
    categoryId,
    title: safeTitle,
    description: safeDescription,
    employmentType,
    workMode,
    city: safeCity,
    salaryMin: Number(salaryMin) || 0,
    salaryMax: Number(salaryMax) || 0,
    currency,
    status,
    expiresAt: expiresAt ?? null,
    skillIds,
    createdAt,
    updatedAt: createdAt
  }

  db.jobs.push(job)
  await writeDb(db)

  return res.status(201).json(enrichJob(job, db))
})

app.put('/api/jobs/:id', authenticateToken, async (req, res) => {
  const db = await readDb()
  const job = db.jobs.find((item) => item.id === req.params.id)

  if (!job) {
    return res.status(404).json({ message: 'Az álláshirdetés nem található.' })
  }

  const company = db.companies.find((item) => item.id === job.companyId)

  // Csak a cég tulajdonosa vagy admin szerkesztheti
  if (company?.ownerUserId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Ehhez az álláshirdetéshez nincs szerkesztési joged.' })
  }

  const next = req.body

  job.companyId = next.companyId ?? job.companyId
  job.categoryId = next.categoryId ?? job.categoryId
  job.title = next.title ? sanitizeText(next.title) : job.title
  job.description = next.description ? sanitizeText(next.description) : job.description
  job.employmentType = next.employmentType ?? job.employmentType
  job.workMode = next.workMode ?? job.workMode
  job.city = next.city ? sanitizeText(next.city) : job.city
  job.salaryMin = next.salaryMin !== undefined ? Number(next.salaryMin) : job.salaryMin
  job.salaryMax = next.salaryMax !== undefined ? Number(next.salaryMax) : job.salaryMax
  job.currency = next.currency ?? job.currency
  job.status = next.status ?? job.status
  job.expiresAt = next.expiresAt ?? job.expiresAt
  job.skillIds = Array.isArray(next.skillIds) ? next.skillIds : job.skillIds
  job.updatedAt = nowIso()

  await writeDb(db)
  return res.json(enrichJob(job, db))
})

app.delete('/api/jobs/:id', authenticateToken, async (req, res) => {
  const db = await readDb()
  const index = db.jobs.findIndex((item) => item.id === req.params.id)

  if (index === -1) {
    return res.status(404).json({ message: 'Az álláshirdetés nem található.' })
  }

  const job = db.jobs[index]
  const company = db.companies.find((item) => item.id === job.companyId)

  // Csak a cég tulajdonosa vagy admin törölheti
  if (company?.ownerUserId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Ehhez az álláshirdetéshez nincs törlési joged.' })
  }

  const jobId = db.jobs[index].id
  db.jobs.splice(index, 1)

  db.applications = db.applications.filter((item) => item.jobId !== jobId)
  db.savedJobs = db.savedJobs.filter((item) => item.jobId !== jobId)

  await writeDb(db)
  return res.status(204).send()
})

app.get('/api/applications', authenticateToken, async (req, res) => {
  const db = await readDb()

  const companyId = typeof req.query.companyId === 'string' ? req.query.companyId : ''

  let list = db.applications.map((appItem) => {
    const job = db.jobs.find((jobItem) => jobItem.id === appItem.jobId)
    const user = db.users.find((userItem) => userItem.id === appItem.applicantUserId)

    return {
      ...appItem,
      companyId: job?.companyId ?? '',
      jobTitle: job?.title ?? 'Ismeretlen állás',
      applicantName: user?.fullName ?? 'Ismeretlen jelentkező'
    }
  })

  if (companyId) {
    list = list.filter((item) => item.companyId === companyId)
  }

  res.json(list)
})

app.post('/api/applications', authenticateToken, async (req, res) => {
  const { jobId, applicantUserId, cvUrl = '', motivation = '' } = req.body
  const safeCvUrl = sanitizeText(cvUrl)
  const safeMotivation = sanitizeText(motivation)

  if (!jobId || !applicantUserId) {
    return res.status(400).json({ message: 'A jelentkezéshez kötelező a jobId és applicantUserId.' })
  }

  // Csak a saját fiókjában lehet jelentkezni
  if (applicantUserId !== req.user.id) {
    return res.status(403).json({ message: 'Csak a saját fiókodba tudsz jelentkezni.' })
  }

  const db = await readDb()
  const hasJob = db.jobs.some((item) => item.id === jobId)
  const hasUser = db.users.some((item) => item.id === applicantUserId)

  if (!hasJob || !hasUser) {
    return res.status(400).json({ message: 'Érvénytelen jobId vagy applicantUserId.' })
  }

  const createdAt = nowIso()
  const application = {
    id: newId('app'),
    jobId,
    applicantUserId,
    cvUrl: safeCvUrl,
    motivation: safeMotivation,
    status: 'new',
    createdAt,
    updatedAt: createdAt
  }

  db.applications.push(application)
  await writeDb(db)

  return res.status(201).json(application)
})

app.put('/api/applications/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  const { status } = req.body

  if (!status) {
    return res.status(400).json({ message: 'A status kötelező.' })
  }

  const db = await readDb()
  const application = db.applications.find((item) => item.id === req.params.id)

  if (!application) {
    return res.status(404).json({ message: 'A jelentkezés nem található.' })
  }

  application.status = status
  application.updatedAt = nowIso()

  await writeDb(db)
  return res.json(application)
})

app.get('/api/saved-jobs', authenticateToken, async (req, res) => {
  const userId = typeof req.query.userId === 'string' ? req.query.userId : ''
  const db = await readDb()

  const scoped = userId ? db.savedJobs.filter((item) => item.userId === userId) : db.savedJobs
  const enriched = scoped.map((saved) => {
    const job = db.jobs.find((jobItem) => jobItem.id === saved.jobId)
    return {
      ...saved,
      job: job ? enrichJob(job, db) : null
    }
  })

  res.json(enriched)
})

app.post('/api/saved-jobs', authenticateToken, async (req, res) => {
  const { userId, jobId } = req.body

  if (!userId || !jobId) {
    return res.status(400).json({ message: 'A mentéshez userId és jobId szükséges.' })
  }

  // Csak a saját fiókjában lehet menteni
  if (userId !== req.user.id) {
    return res.status(403).json({ message: 'Csak a saját fiókodba tudsz állásokat menteni.' })
  }

  const db = await readDb()
  const exists = db.savedJobs.some((item) => item.userId === userId && item.jobId === jobId)

  if (exists) {
    return res.status(409).json({ message: 'Ez az állás már mentve van ennél a felhasználónál.' })
  }

  const saved = {
    id: newId('saved'),
    userId,
    jobId,
    createdAt: nowIso()
  }

  db.savedJobs.push(saved)
  await writeDb(db)

  return res.status(201).json(saved)
})

app.delete('/api/saved-jobs/:id', authenticateToken, async (req, res) => {
  const db = await readDb()
  const index = db.savedJobs.findIndex((item) => item.id === req.params.id)

  if (index === -1) {
    return res.status(404).json({ message: 'A mentett állás rekord nem található.' })
  }

  const saved = db.savedJobs[index]

  // Csak a saját mentett állásait törölheti
  if (saved.userId !== req.user.id) {
    return res.status(403).json({ message: 'Csak a saját mentett állásaidat törölheted.' })
  }

  db.savedJobs.splice(index, 1)
  await writeDb(db)

  return res.status(204).send()
})

app.use((_req, res) => {
  res.status(404).json({ message: 'Nincs ilyen végpont.' })
})

app.listen(PORT, () => {
  console.log(`JobFinder API fut: http://localhost:${PORT}`)
})
