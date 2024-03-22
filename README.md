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
  VITE_AUTH0_DOMAIN=YOUR_AUTH0_DOMAIN
  VITE_AUTH0_CLIENT_ID=YOUR_AUTH0_CLIENT_ID
  VITE_GOOGLE_API_KEY=YOUR_GOOGLE_API_KEY
  VITE_GOOGLE_ID=YOUR_GOOGLE_ID

  dont forget to customize .env with your:
  AUTH0_DOMAIN
  AUTH0_CLIENT_ID
  GOOGLE_API_KEY
  GOOGLE_ID

11. go back to the terminal
12. npm run dev
13. navigate to http://localhost:5173/
