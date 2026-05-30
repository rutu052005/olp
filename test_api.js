import axios from 'axios';

async function test() {
  try {
    const res = await axios.post('https://olp-sigma.vercel.app/api/auth/login', {
      email: 'student@learnsphere.edu',
      password: 'password'
    });
    console.log('Success:', res.data);
  } catch (err) {
    console.log('Error:', err.response?.status);
    console.log('Data:', err.response?.data);
    console.log('Text:', err.message);
  }
}

test();
