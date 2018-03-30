var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');

var mysqlPool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '111111',
  database: 'kitae'
});

var app = express();
app.use(bodyParser.urlencoded({
  extended: false
}));
app.locals.pretty = true;
app.use(express.static('./'));
app.set('views', './kitae_mysql');
app.set('view engine', 'ejs');

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
  mysqlPool.getConnection(function(err, conn) {
    if(err) throw err;
    conn.query(sql, function(err, datas) {
      if (err) {
        conn.release();
        console.log(err);
        return;
      } else {
        console.log(datas)

        var result = [
          {
            latestHeightPercent: datas[0].height,
            latestTime: datas[0].time,
            title: '공학1관 쓰레기통',
            lat: 36.765797,
            lng: 127.281271
          },
          {
            latestHeightPercent: 50,
            latestTime: '2018-03-09 14:19:08',
            title: '인문경영관 쓰레기통',
            lat: 36.765220,
            lng: 127.281771
          },
          {
            latestHeightPercent: 50,
            latestTime: '2018-03-09 14:19:08',
            title: '대강당 쓰레기통',
            lat: 36.764403,
            lng: 127.280594
          },
          {
            latestHeightPercent: 50,
            latestTime: '2018-03-09 14:19:08',
            title: '본관 교차로 쓰레기통',
            lat: 36.764360,
            lng: 127.281963
          },
          {
            latestHeightPercent: 50,
            latestTime: '2018-03-09 14:19:08',
            title: 'GEC 인경관 사이 쓰레기통',
            lat: 36.764614,
            lng: 127.281222
          }
        ];

        res.render('map', {
          // datas: datas,
          // devices: device,
          dates: ['', ''],
          result: result
        });
        conn.release();
      }
    });
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
  mysqlPool.getConnection(function(err, conn) {
    if(err) throw err;
    conn.query(sql, dates, function(err, datas, fields) {
      if (err) {
        conn.release();
        console.log(err);
        return;
      } else {
        sql = "SELECT DISTINCT garbageid from sensordata";
        conn.query(sql, function(err, devices) {
          if (err) {
            conn.release();
            console.log(err);
            return;
          } else {
            dates = (!dates || dates.length < 2) ? ['', ''] : dates;
            res.render('map', {
              datas: datas,
              devices: devices,
              dates: dates
            });
            conn.release();
          }
        });
      }
    });
  });
});

app.get(['/data/statistics'], function(req, res) {
  var sql = 'select garbageid, height, date_format(time, "%Y-%m-%d %HH") from sensordata;';
  mysqlPool.getConnection(function(err, conn) {
    if(err) throw err;
    conn.query(sql, function(err, datas, fields) {
      if (err) {
        conn.release();
        console.log(err);
        return;
      } else {
        sql = 'SELECT DISTINCT garbageid FROM sensordata';
        conn.query(sql, function(err, device) {
          if (err) {
            conn.release();
            console.log(err);
            return;
          } else {
            res.render('index2', {
              datas: [],
              devices: device,
              dates: [0, -1]
            });
            conn.release();
          }
        });
      }
    });
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
  mysqlPool.getConnection(function(err, conn) {
    if(err) throw err;
    conn.query(sql, [today, today2], function(err, datas, fields) {
      if (err) {
        conn.release();
        console.log(err);
        return;
      } else {
        sql = 'SELECT DISTINCT garbageid FROM sensordata';
        conn.query(sql, function(err, device) {
          if (err) {
            conn.release();
            console.log(err);
            return;
          } else {
            res.render('index2', {
              datas: datas,
              devices: device,
              dates: [today, today2]
            });
            conn.release();
          }
        });
      }
    });
  });
});

app.post('/data/statistics', function(req, res) {
  var time = req.body.time;
  var dates = time.match(new RegExp("\\d*-\\d*-\\d*", "g"));
  var sql = 'select height, date_format(time, "%Y-%m-%d %HH") as t from sensordata where time >= ? and time <= DATE_ADD(?, INTERVAL 1 DAY)';
  mysqlPool.getConnection(function(err, conn) {
    if(err) throw err;
    conn.query(sql, dates, function(err, datas, fields) {
      if (err) {
        conn.release();
        console.log(err);
        return;
      } else {
        sql = "SELECT DISTINCT garbageid from sensordata";
        conn.query(sql, function(err, devices, fields) {
          if (err) {
            conn.release();
            console.log(err);
            return;
          } else {
            res.render('index2', {
              datas: datas,
              dates: dates,
              devices: devices
            });
            conn.release();
          }
        });
      }
    });
  });
});

app.get('/data/statistics_calendar', function(req, res) {
  var sql = 'select garbageid, height, date_format(time, "%Y-%m-%d") as time from sensordata';
  mysqlPool.getConnection(function(err, conn) {
    conn.query(sql, function(err, datas, fields) {
      console.log(datas);
      if (err) {
        conn.release();
        console.log(err);
        return;
      } else {
        sql = "SELECT DISTINCT garbageid from sensordata";
        conn.query(sql, function(err, devices) {
          if (err) {
            conn.release();
            console.log(err);
            return;
          } else {
            res.render('index3_1', {
              datas: datas,
              devices: devices
            });
            conn.release();
          }
        });
      };
    });
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
  mysqlPool.getConnection(function(err, conn) {
    if(err) throw err;
    conn.query(sql, function(err, datas, fields) {
      if (err) {
        conn.release();
        console.log(err);
        return;
      } else {
        sql = "SELECT DISTINCT garbageid from sensordata";
        conn.query(sql, function(err, devices) {
          if (err) {
            conn.release();
            console.log(err);
            return;
          } else {
            res.render('index3', {
              datas: datas,
              devices: devices
            });
            conn.release();
          }
        });
      }
    });
  });
});


app.post('/data/daychart', function(req, res) {
  var date = req.body.date;
  console.log(date);
  var sql = 'select garbageid, height, date_format(time, "%Y-%m-%d %HH") as time from sensordata where time >= ? and time < DATE_ADD(?, INTERVAL 1 DAY)';
  mysqlPool.getConnection(function(err, conn) {
    if(err) throw err;
    conn.query(sql, [date, date], function(err, datas, fields) {
      if (err) {
        conn.release();
        console.log(err);
        return;
      } else {
        if (datas == '') {
          datas = [0, -1];
        }
        console.log(datas);
        res.render('daychart', {
          date: datas
        });
        conn.release();
      }
    });
  });
});

app.get('/rasp', function(req, res) {
  var results = req.query.data;
  console.log(results);
  var datas = {};
  for(i in results) {
    datas = results[i];
  }
  heights = [];
  for(i in results) {
   heights.push(results[i]);
   console.log(heights);
   }
  var sql = "INSERT INTO sensordata (garbageid, height, time) VALUES(?, ?, ?)";
  mysqlPool.getConnection(function(err, conn) {
    if(err) throw err;
    conn.query(sql, [heights[0], heights[1], heights[2]], function(err, datas, fields) {
      if (err) {
        conn.release();
        console.log(err);
        return;
      } else {
        res.send('ok');
        conn.release();
      }
    });
  });
});

app.listen(64000, function() {
  console.log('Connected 64000 port!');
});
