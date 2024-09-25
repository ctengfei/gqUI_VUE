import JSEncrypt from 'jsencrypt/bin/jsencrypt.min'

// 密钥对生成 http://web.chacuo.net/netrsakeypair

// const publicKey = `MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAL1Vzg6c4yCoY0rs2knkV7FIoWfGqneo
// D9gvIbhgCdwsKWRilgdQZBUSolv0zO2b8nzYegUeQAlntClTFxX/+HcCAwEAAQ==`
const publicKey ='MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAKKmijLYtCeDWOEqp4G8vwQCNDRnVJjC' +
'gtfwgOqll2H/JPEpkrYYp3xJobYo7PDQi/rPz4VQP9TfG3pY2aHTxkMCAwEAAQ==';

const privateKey = 'MIIBVQIBADANBgkqhkiG9w0BAQEFAASCAT8wggE7AgEAAkEAoqaKMti0J4NY4Sqn'+
'gby/BAI0NGdUmMKC1/CA6qWXYf8k8SmSthinfEmhtijs8NCL+s/PhVA/1N8beljZ'+
'odPGQwIDAQABAkBMOAy07RXnGkbxJSLfygodH8dE81MSTrwv4vUWgEijU8SmlASA'+
'Z/6b///imExloMrnSej0QGvCdJ5K8pFRli9RAiEA04GjvddvbYX7YCqUKhN+f6LX'+
'JNpCTJWPyi3HLoevpxsCIQDE3ddYrgrr7DKZUOVNMGKKUC3QRP8Ygl41Fgu+W0GH'+
'+QIgVH5UsHFRBVrh6i/4UrrI7SpbclBy7e9NqwIQsSjpZgMCIQCHhuViYmaYZgGr'+
'dHp3OjEMYQg5Eda/y7gJOcUZ5f7mGQIhAJmutVfLXe415vPW15fSCDJ0CH3xDkrp'+
'XCNGvq7Dcjwv'

// 加密
export function encrypt(txt) {
  const encryptor = new JSEncrypt()
  encryptor.setPublicKey(publicKey) // 设置公钥
  return encryptor.encrypt(txt) // 对数据进行加密
}

// 解密
export function decrypt(txt) {
  const encryptor = new JSEncrypt()
  encryptor.setPrivateKey(privateKey) // 设置私钥
  return encryptor.decrypt(txt) // 对数据进行解密
}

