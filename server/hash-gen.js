import bcrypt from 'bcryptjs'

async function hashPasswords() {
  const testPassword = 'test123'
  const hash1 = await bcrypt.hash(testPassword, 10)
  console.log('test123 hash:', hash1)
}

hashPasswords()
