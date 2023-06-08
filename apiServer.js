const express = require('express');
const multer = require('multer')
var cors = require('cors')
const { client,connect, getDB } = require('./db');

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

// const corsOptions ={
//   origin:'*', 
//   credentials:true,            //access-control-allow-credentials:true
//   optionSuccessStatus:200,
// }

// app.use(cors(corsOptions)) // Use this after the variable declaration

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/'); // Define the directory where the images will be stored
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const extension = file.originalname.split('.').pop();
      cb(null, file.fieldname + '-' + uniqueSuffix + '.' + extension);
    },
  });
  const upload = multer({ storage });

// register user
app.post('/api/users', async (req, res) => {
    try {
      await connect();
     const db = getDB();
    //   const db = client.db('councildb');
      const collection = db.collection('users');
      
      const newUser = req.body;
      const result = await collection.insertOne(newUser);
      
      res.status(201).json(result.ops[0]);
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'An error occurred' });
    } finally {
      await client.close();
    }
  });

  // Login endpoint
app.post('/api/login', async (req, res) => {
    try {
      await connect();
      const db = getDB();
    //   const db = client.db('councildb');
      const collection = db.collection('users');
      
      const { username, password } = req.body;
      
      // Find the user with the given username and password
      const user = await collection.findOne({ username, password });
      
      if (user) {
        res.json({ message: 'Login successful' });
      } else {
        res.status(401).json({ error: 'Invalid credentials' });
      }
    } catch (error) {
      console.error('Error logging in:', error);
      res.status(500).json({ error: 'An error occurred' });
    } finally {
      await client.close();
    }
  });

  // API endpoint for handling form data
app.post('/api/form', upload.single('image'), async (req, res) => {
    try {
      await connect();
      const db = getDB();
    //   const db = client.db('councildb');
      const collection = db.collection('forms');
  
      const { fullname, email, address, contactNumber, description, complaints } = req.body;
  
      const newForm = {
        fullname: fullname,
        email: email,
        address: address,
        contactNumber: contactNumber,
        description: contactNumber,
        complaints: complaints,
        image: req.file.filename, // Save the filename of the uploaded image
      };
  console.log(newForm);
      const result = await collection.insertOne(newForm);
  
      res.status(201).json(result.ops[0]);
    } catch (error) {
      console.error('Error creating form:', error);
      res.status(500).json({ error: 'An error occurred' });
    } finally {
      await client.close();
    }
  });

  // Edit a form entry
app.put('/api/form/:id', upload.single('image'), async (req, res) => {
    try {
      await connect();
      const db = getDB();
    //   const db = client.db('councildb');
      const collection = db.collection('forms');
      
      const { id } = req.params;
      const { fullname, email, address, contactNumber, description, complaints } = req.body;
      
      const updatedForm = {
        fullname,
        email,
        address,
        contactNumber,
        description,
        complaints,
      };
      
      if (req.file) {
        updatedForm.image = req.file.filename; // Save the filename of the uploaded image
      }
      
      const result = await collection.updateOne({ _id: ObjectId(id) }, { $set: updatedForm });
      
      if (result.modifiedCount === 1) {
        res.json({ message: 'Form entry updated successfully' });
      } else {
        res.status(404).json({ error: 'Form entry not found' });
      }
    } catch (error) {
      console.error('Error updating form entry:', error);
      res.status(500).json({ error: 'An error occurred' });
    } finally {
      await client.close();
    }
  });

  // Retrieve all form entries
app.get('/api/form', async (req, res) => {
    try {
      await client.connect();
    //   const db = client.db('councildb');
    const db = getDB();
      const collection = db.collection('forms');
      
      const forms = await collection.find().toArray();
      
      res.json(forms);
    } catch (error) {
      console.error('Error retrieving form entries:', error);
      res.status(500).json({ error: 'An error occurred' });
    } finally {
      await client.close();
    }
  });

connect()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to the database:', error);
    process.exit(1);
  });
