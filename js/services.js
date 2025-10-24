export async function login(user, pass, role) {
try {
const res = await fetch('https://dummyjson.com/auth/login', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({

username: user,
password: pass,
role
})
// Descomentando se incluyen cookies (e.g., accessToken) en el pedido
// ,
// credentials: 'include'
});
if (!res.ok) {
console.log('Authentication failed');
return false;
}
const data = await res.json();
return data;

} catch (error) {
console.log('Error');
return false;
}
}
login('emi', 'pass')
// out put:
// {
// "id": 1,
// "username": "emilys",
// "email": "emily.johnson@x.dummyjson.com",
// "firstName": "Emily",
// "lastName": "Johnson",
// "gender": "female",
// "image": "https://dummyjson.com/icon/emilys/128",
// "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", // JWT accessToken (for backward compatibility) in response and cookies
// "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." // refreshToken in response and cookies
// }


