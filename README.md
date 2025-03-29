1. Clone repo to VS Code
2. Open new terminal in VS Code
3. cd server
4. npm i
5. nodemon server
6. Open another new terminal in VS Code
7. cd client
8. npm i
9. Create a new file in the client folder - name it .env

10. copy the code below and paste it to the .env file:
<br>VITE_AUTH0_DOMAIN=YOUR_AUTH0_DOMAIN
<br>VITE_AUTH0_CLIENT_ID=YOUR_AUTH0_CLIENT_ID
<br>VITE_GOOGLE_API_KEY=YOUR_GOOGLE_API_KEY
<br>VITE_GOOGLE_ID=YOUR_GOOGLE_ID
<br>VITE_BACKEND_URL=YOUR_BACKEND_URL

11. dont forget to customize .env with your:
  <br>AUTH0_DOMAIN
  <br>AUTH0_CLIENT_ID
  <br>GOOGLE_API_KEY
  <br>GOOGLE_ID
  <br>BACKEND_URL

12. go back to the terminal
13. npm run dev
14. navigate to http://localhost:5173/
