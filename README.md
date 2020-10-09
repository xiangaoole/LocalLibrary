# LocalLibrary
This is a pratice following MDN's express tutorial: https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs

> MDN implemets their own version here: https://github.com/mdn/express-locallibrary-tutorial



This project is deployed in heroku so you can visit it: https://intense-everglades-72781.herokuapp.com/



## Quick Start

To get this project up and running locally on your computer:

1. Set up a [Nodejs](https://wiki.developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/development_environment) development environment.
1. Once you have node setup, enter the following commands in the root of your clone of this repo:
   ```
   yarn add
   npm run serverstart   #For linux
   ```
1. Open a browser to http://localhost:3000/ to open the library site.

> **Note:** The library uses a default MongoDb database hosted on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas). You should use a different database for your own code experiments.
>
> ```js
> // './app.js'
> 
> // Set up mongoose connection
> const dev_db_url =
>   'mongodb+srv://cooluser:coolpassword@cluster0-mbdj7.mongodb.net/local_library?retryWrites=true';
> const mongoDB = process.env.MONGODB_URI_LOCAL_LIBRARY || dev_db_url;
> mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
> ```
>
> ```bash
> export MONGODB_URI_LOCAL_LIBRARY='mongodb+srv://your_username:your_password@cluster0.ersjg.azure.mongodb.net/local_library?retryWrites=true&w=majority'
> ```
>
> 

