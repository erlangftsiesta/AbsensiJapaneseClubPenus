const express = require('express');
const app = express();
const conn = require('./config/db');
const ejs = require('ejs');
const multer = require('multer');
const path = require("path");
const csv = require("fast-csv");


app.use(express.static(("dist")));
app.use(express.static('src'));
app.use(express.json());
app.use(express.urlencoded({extended: true}))

app.set("view engine", "ejs");
app.set("views", "src");

app.get("/export", function (req, res){
  try {
    // Your custom SQL query to fetch data from the database
    const sqlQuery = "SELECT * FROM rpl3"; // Replace with your actual table name

    conn.query(sqlQuery, (err, results) => {
      if (err) throw err;
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename="+"absen.csv");
    csv.write(results, {headers: true}).pipe(res);
    })
  } catch (err) {
    console.error("Error occurred:", err);
    res.status(500).send("An error occurred during the export process.");
  }
})

//all bug fixed, Status: OK!
app.get('/data-absensi-rpl3', function(req, res){
    const param = req.query;

    const queryStr = `SELECT * FROM rpl3`;

    conn.query(queryStr, (err, result)=> {
        if(err) {
            console.log(err);
            res.status(500).json({
                "success": false,
                "message": err.sqlMessage,
                "data": null
            });
        } else {
            res.render("index", {rpl3: result});
            // res.status(200).json({
            //     "data": result
            // }) 
        }
    })
})


//all bug fixed, Status: OK!
app.get('/cari-data-absensi-rpl3', function(req, res){
    const param = req.query;
    const nama = param.nama;

    const queryStr = `SELECT * FROM rpl3 WHERE nama = ?`;
    const values = [nama];

    conn.query(queryStr, values, (err, result)=> {
        if(err) {
            console.log(err);
            res.status(500).json({
                "success": false,
                "message": err.sqlMessage,
                "data": null
            });
        } else {
            res.render("cariData", {rpl3: result});
            // console.log(result)
            // res.status(200).json({
            //     "success": true,
            //     "Message": "berhasil memuat data",
            //     "data": result
            // });
        }
    })
})

//a few bug fixed, Status: Warning!
app.post('/update-absensi-rpl3', function (req, res) {
    const param = req.body;
    const id = param.id;
    const nama = param.nama;
    const absen = param.absen;
    const now = new Date();

    const queryStr = `UPDATE rpl3 SET nama = ?, absen = ? WHERE id = ? AND deleted_ad IS NULL`;
    const values = [nama, absen, id, now];
    
    conn.query(queryStr, values, (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).json({
                "success": false,
                "message": err.sqlMessage,
                "data": null
            });
        } else {
            res.status(200).json( {
                "success": true,
                "message": "Sukses Merubah Data",
                "data": result
            });
        }
    });
});

//POST IMAGE
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'src/gambar')
    },
    filename: (req, file, cb) => {
      // bikin file nama random
      cb(null, Date.now() + path.extname(file.originalname));
    }
  });

//multer uploadnya:
const upload = multer({storage: storage});

app.get('/uploadImg', (req, res)=> {
    res.render('index', {rpl3: result});
})
app.post('/uploadImage', upload.single('image'), (req, res) => {
    if (!req.file) {
      // Kalo gada file yg di upload, kasih signal error
      return res.status(400).json({ error: 'No file uploaded.' });
    }
  
    // ambil PATH gambar yg diupload
    const filePath = req.file.path;
  
    // kirim file gambar sebagai respon
    res.json({ filePath });
  });

app.get('/getAllImages', (req, res) => {
    const fs = require('fs');
    const imageDir = ("src/gambar");
    fs.readdir(imageDir, (err, files) => {
        if (err) {
          console.error(err);
          res.status(500).json({ error: 'Failed to fetch images' });
        } else {
          files = files.filter(file => !file.startsWith('.')); // biar yang kebaca semua file
          res.json(files);
        }
      });
})
app.get('/imageGet', (req, res) => {
  const imageName = req.query.name.replace("src\\gambar\\","");
  // logika buat ngefetch gambar terus masukin ke direktori src/gambar
  const imagePath = path.join(__dirname, 'src/gambar', imageName);
  res.sendFile(imagePath);
});

//a few bugs has been detected, Status: Warning!
app.post('/req-absensi-rpl3', upload.single('foto'), function (req, res) {
  const param = req.body;
  const nama = param.nama;
  const absen = param.absen;
  const date = new Date();
  const foto = req.file ? req.file.path : null; // dapetin PATH file nya, "KALO ADA".

  const queryStr = `INSERT INTO rpl3 (absen, nama, foto, created_ad) VALUES (?,?,?,?)`;
  const values = [absen, nama, foto, date];

  conn.query(queryStr, values, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).json({
        "success": false,
        "message": err.sqlMessage,
        "data": null
      });
    } else {
      res.redirect("/data-absensi-rpl3");
      // res.status(200).json( {
      //     "success": true,
      //     "message": "Sip Kesimpen",
      //     "data" : result
      // });
    }
  });
});
app.listen(8080);