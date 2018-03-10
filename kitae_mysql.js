var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer')
var _storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
})
var upload = multer({
  storage: _storage
})
var fs = require('fs');
var mysql = require('mysql');
var conn = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '111111',
  database: 'kitae'
});
conn.connect();
var app = express();
app.use(bodyParser.urlencoded({
  extended: false
}));
app.locals.pretty = true;
app.use(express.static('./'));
app.set('views', './kitae_mysql');
app.set('view engine', 'ejs');
app.get('/upload', function(req, res) {
  res.render('upload');
});

app.get('/location', function(req, res) {
  var sql = `
  SELECT sensordata.* FROM (
  	SELECT MAX(x.id) as id, x.garbageid
  	FROM sensordata x
  		JOIN (SELECT DISTINCT garbageid FROM sensordata) y
  		ON y.garbageid = x.garbageid
  	GROUP BY x.garbageid
  ) t, sensordata
  WHERE t.id = sensordata.id
  `;

  conn.query(sql, function(err, datas) {
    if (err) {
      console.log(err);
      res.status(500).send('Internal Server Error');
    } else {
      console.log(datas)

      var result = [
        {
          latestHeightPercent: 70,
          latestTime: "2018-03-09 14:19:08",
          title: '공학1관 쓰레기통',
          lat: 36.765797,
          lng: 127.281271
        },
        {
          latestHeightPercent: 70,
          latestTime: "2018-03-09 14:19:08",
          title: '인문경영관 쓰레기통',
          lat: 36.765220,
          lng: 127.281771
        },
        {
          latestHeightPercent: 50,
          latestTime: "2018-03-09 14:19:08",
          title: '담헌 쓰레기통',
          lat: 36.765937,
          lng: 127.282200
        }
      ];

      res.render('map', {
        // datas: datas,
        // devices: device,
        dates: ['', ''],
        result: result
      });
    }
  });
});

app.post('/data/search', function(req, res) {
  var time = req.body.time;
  var dates = time.match(new RegExp("\\d*-\\d*-\\d*", "g"));
  var device = req.body.selectbox;
  var sql = "SELECT * from sensordata where";
  if (time != '') {
    sql += " (time >= ? and time <= DATE_ADD(?, INTERVAL 1 DAY)) and";
  }
  if (device != "*") {
    sql += " garbageid='" + device + "' and";
  }
  if (sql.endsWith('where') || sql.endsWith('and')) {
    sql += " true";
  }
  conn.query(sql, dates, function(err, datas, fields) {
    if (err) {
      console.log(err);
      res.status(500).send('Internal Server Error');
    } else {
      sql = "SELECT DISTINCT garbageid from sensordata";
      conn.query(sql, function(err, devices) {
        if (err) {
          console.log(err);
          res.status(500).send('Internal Server Error');
        } else {
          dates = (!dates || dates.length < 2) ? ['', ''] : dates;
          res.render('map', {
            datas: datas,
            devices: devices,
            dates: dates
          });
        }
      });
    }
  });
});
app.get(['/data/statistics'], function(req, res) {
  var sql = 'select garbageid, height, date_format(time, "%Y-%m-%d %HH") from sensordata;';
  conn.query(sql, function(err, datas, fields) {
    if (err) {
      console.log(err);
      res.status(500).send('Internal Server Error');
    } else {
      sql = 'SELECT DISTINCT garbageid FROM sensordata';
      conn.query(sql, function(err, device) {
        if (err) {
          console.log(err);
          res.status(500).send('Internal Server Error');
        } else {
          res.render('index2', {
            datas: [],
            devices: device,
            dates: [0, -1]
          });
        }
      });
    }
  });
});
app.post(['/data/statistics/device'], function(req, res) {
  var deviceId = req.body.name;
  var d = new Date();
  function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
  }
  var today = d.getFullYear() + '-' + pad((d.getMonth() + 1), 2) + '-' + pad((d.getDate()), 2);
  var today2 = d.getFullYear() + '-' + pad((d.getMonth() + 2), 2) + '-' + pad((d.getDate()), 2);
  var sql = "select garbageid, height, date_format(time, '%Y-%m-%d %HH') as t from sensordata where garbageid = '" + deviceId + "' and time >= ? and time <= ?;";
  conn.query(sql, [today, today2], function(err, datas, fields) {
    if (err) {
      console.log(err);
      res.status(500).send('Internal Server Error');
    } else {
      sql = 'SELECT DISTINCT garbageid FROM sensordata';
      conn.query(sql, function(err, device) {
        if (err) {
          console.log(err);
          res.status(500).send('Internal Server Error');
        } else {
          res.render('index2', {
            datas: datas,
            devices: device,
            dates: [today, today2]
          });
        }
      });
    }
  });
});
app.post('/data/statistics', function(req, res) {
  var time = req.body.time;
  var dates = time.match(new RegExp("\\d*-\\d*-\\d*", "g"));
  var sql = 'select height, date_format(time, "%Y-%m-%d %HH") as t from sensordata where time >= ? and time <= DATE_ADD(?, INTERVAL 1 DAY)';
  conn.query(sql, dates, function(err, datas, fields) {
    if (err) {
      console.log(err);
      res.status(500).send('Internal Server Error');
    } else {
      sql = "SELECT DISTINCT garbageid from sensordata";
      conn.query(sql, function(err, devices, fields) {
        if (err) {
          console.log(err);
          res.status(500).send('Internal Server Error');
        } else {
          res.render('index2', {
            datas: datas,
            dates: dates,
            devices: devices
          });
        }
      });
    }
  });
});
app.get('/data/statistics_calendar', function(req, res) {
  var sql = 'select garbageid, height, date_format(time, "%Y-%m-%d") as time from sensordata';
  conn.query(sql, function(err, datas, fields) {
    console.log(datas);
    if (err) {
      console.log(err);
      res.status(500).send('Internal Server Error');
    } else {
      sql = "SELECT DISTINCT garbageid from sensordata";
      conn.query(sql, function(err, devices) {
        if (err) {
          console.log(err);
          res.status(500).send('Internal Server Error');
        }
        res.render('index3_1', {
          datas: datas,
          devices: devices
        });
      });
    };
  });
});
app.post('/data/statistics_calendar', function(req, res) {
  var device = req.body.selectbox;
  var sql = 'SELECT garbageid, height, date_format(time, "%Y-%m-%d") as time from sensordata where';
  if (device != "*") {
    sql += " garbageid='" + device + "' and";
  }
  if (sql.endsWith('where') || sql.endsWith('and')) {
    sql += " true";
  }
  conn.query(sql, function(err, datas, fields) {
    if (err) {
      console.log(err);
      res.status(500).send('Internal Server Error');
    } else {
      sql = "SELECT DISTINCT garbageid from sensordata";
      conn.query(sql, function(err, devices) {
        if (err) {
          console.log(err);
          res.status(500).send('Internal Server Error');
        } else {
          res.render('index3', {
            datas: datas,
            devices: devices
          });
        }
      });
    }
  });
});
app.post('/data/daychart', function(req, res) {
  var date = req.body.date;
  console.log(date);
  var sql = 'select garbageid, height, date_format(time, "%Y-%m-%d %HH") as time from sensordata where time >= ? and time < DATE_ADD(?, INTERVAL 1 DAY)';
  conn.query(sql, [date, date], function(err, datas, fields) {
    if (err) {
      console.log(err);
      res.status(500).send('Internal Server Error');
    } else {
      if (datas == '') {
        datas = [0, -1];
      }
      console.log(datas);
      res.render('daychart', {
        date: datas
      });
    }
  });
});

app.listen(64000, function() {
  console.log('Connected 64000 port!');
});
