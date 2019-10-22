# React Chat Widget with CometChat and Boostrap

## Technologies

This demo app uses the following:

- [CometChat Pro](https://cometchat.com)
- [React.js](https://reactjs.org)
- [Bootstrap](https://getbootstrap.com)

## How To Run

In order to run the demo application locally, you'll need to follow the following steps:

1. Create a [CometChat Pro](https://cometchat.com) account.
2. Go to the [CometChat Pro Dashboard](https://app.cometchat.com/#/apps), create a new app called **React Chat Widget** hit the **+** button.
3. You should be redirected to your newly created app, now click on the **Explore** button to view your app details.
4. Go to the **API Keys** tab and you should see an already generated **App ID** and **API Key**
5. Copy the details from the list with **Full Access** as Scope.
6. Go to the **Users** tab and create a new user. Use **Admin** as the name and **admin** as the uid of the user.
7. Clone this repository and move into the newly created project directory. Then `cd backend`, create a `.env` file and paste the following snippet.

```
COMETCHAT_API_KEY=YOUR_API_KEY
COMETCHAT_APP_ID=YOUR_APP_ID
```

8. Run `npm install` in `frontend` and `backend` folders to install all the dependencies.
9. Run `npm run server` in `backend` to start the node.js development server on port 4000.
10. Run `npm run start` in `frontend` to start the react app in development mode
11. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Available Routes

This app contains two routes namely:

1. Home route at [/](http://localhost:3000)
2. Admin route at [/admin](http://localhost:3000/admin)

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

To learn more about CometChat, check out the [CometChat Pro documentation](https://prodocs.cometchat.com/).
