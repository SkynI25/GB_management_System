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
  WHERE t.id = sensordata.id order by garbageid ASC
  `;
  mysqlPool.getConnection(function(err, conn) {
    if(err) throw err;
    conn.query(sql, function(err, datas) {
      if (err) {
        conn.release();
        console.log(err);
        return;
      } else {
        var result = [
          {
            latestHeightPercent: datas[0].height,
            latestTime: datas[0].time,
            title: '공학1관 쓰레기통',
            lat: 36.765565,
            lng: 127.281254
          },
          {
            latestHeightPercent: datas[1].height,
            latestTime: datas[1].time,
            title: '인문경영관 매점 쓰레기통',
            lat: 36.765220,
            lng: 127.281771
          },
          {
            latestHeightPercent: datas[2].height,
            latestTime: datas[2].time,
            title: '대강당 쓰레기통',
            lat: 36.764403,
            lng: 127.280594
          },
          {
            latestHeightPercent: datas[3].height,
            latestTime: datas[3].time,
            title: '본관 교차로 쓰레기통',
            lat: 36.764360,
            lng: 127.281963
          },
          {
            latestHeightPercent: datas[4].height,
            latestTime: datas[4].time,
            title: 'GEC 인경관 사이 쓰레기통',
            lat: 36.764614,
            lng: 127.281222
          }
        ];

        res.render('map', {
          datas: datas,
          dates: ['', ''],
          result: result
        });
        conn.release();
      }
    });
  });
});

app.get(['/chart'], function(req, res) {
  var today = "2018-04-28";
  var today2 = "2018-05-05";
  var sql = "select garbageid, height, date_format(time, '%Y-%m-%d %Hh:%im:') as t from sensordata where time >= ? and time <= ?;";
  var deviceName = ['공학 1관 쓰레기통','인문경영관 매점 쓰레기통','대강당 쓰레기통​','본관 교차로 쓰레기통','GEC 인경관 사이 쓰레기통'];
  mysqlPool.getConnection(function(err, conn) {
    if(err) throw err;
    conn.query(sql, [today, today2], function(err, datas, fields) {
      if (err) {
        conn.release();
        console.log(err);
        return;
      } else {
        sql = "SELECT DISTINCT garbageid from sensordata order by garbageid ASC";
        conn.query(sql, function(err, device) {
          if (err) {
            conn.release();
            console.log(err);
            return;
          } else {
            res.render('chartpage1_2', {
              datas: datas,
              dates: [today, today2],
              devices: device,
              deviceName : deviceName
            });
            conn.release();
          }
        });
      }
    });
  });
});

app.post(['/chart/device'], function(req, res) {
  var deviceId = req.body.name;
  var d = new Date();
  function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
  }
  var today = "2018-04-28";
  var today2 = "2018-05-05";
  var sql = "select garbageid, height, date_format(time, '%Y-%m-%d %Hh:%im') as t from sensordata where garbageid = '" + deviceId + "' and time >= ? and time <= ?;";
  var deviceName = ['공학 1관 쓰레기통','인문경영관 매점 쓰레기통','대강당 쓰레기통​','본관 교차로 쓰레기통','GEC 인경관 사이 쓰레기통'];
  mysqlPool.getConnection(function(err, conn) {
    if(err) throw err;
    conn.query(sql, [today, today2], function(err, datas, fields) {
      if (err) {
        conn.release();
        console.log(err);
        return;
      } else {
        sql = "SELECT DISTINCT garbageid from sensordata order by garbageid ASC";
        conn.query(sql, function(err, device) {
          if (err) {
            conn.release();
            console.log(err);
            return;
          } else {
            res.render('chartpage1_1', {
              datas: datas,
              devices: device,
              dates: [today, today2],
              deviceName : deviceName
            });
            conn.release();
          }
        });
      }
    });
  });
});

app.post('/chart', function(req, res) {
  var time = req.body.time;
  var deviceId = req.body.selectbox;
  var dates = time.match(new RegExp("\\d*-\\d*-\\d*", "g"));
  var deviceName = ['공학 1관 쓰레기통','인문경영관 매점 쓰레기통','대강당 쓰레기통​','본관 교차로 쓰레기통','GEC 인경관 사이 쓰레기통'];
  if(deviceId != "*") {
    var sql = "select garbageid, height, date_format(time, '%Y-%m-%d') as t from sensordata where time >= ? and time <= DATE_ADD(?, INTERVAL 1 DAY) and garbageid='"+deviceId+"';";
  }
  else {
    var sql = "select garbageid, height, date_format(time, '%Y-%m-%d') as t from sensordata where time >= ? and time <= DATE_ADD(?, INTERVAL 1 DAY)";
  }
  mysqlPool.getConnection(function(err, conn) {
    if(err) throw err;
    conn.query(sql, dates, function(err, datas, fields) {
      if (err) {
        conn.release();
        console.log(err);
        return;
      } else {
        sql = "SELECT DISTINCT garbageid from sensordata order by garbageid ASC";
        conn.query(sql, function(err, devices, fields) {
          if (err) {
            conn.release();
            console.log(err);
            return;
          } else {
            if(deviceId != "*") {
            res.render('chartpage1_1', {
              datas: datas,
              dates: dates,
              devices: devices,
              choosingID : deviceId,
              deviceName : deviceName
            });
            conn.release();
          } else {
            res.render('chartpage1_2', {
              datas: datas,
              dates: dates,
              devices: devices,
              choosingID : deviceId,
              deviceName : deviceName
            });
            conn.release();
          }
        }
        });
      }
    });
  });
});

app.get('/calendar', function(req, res) {
  var sql = 'select garbageid, height, date_format(time, "%Y-%m-%d") as time from sensordata';
  var deviceName = ['공학 1관 쓰레기통','인문경영관 매점 쓰레기통','대강당 쓰레기통​','본관 교차로 쓰레기통','GEC 인경관 사이 쓰레기통'];
  mysqlPool.getConnection(function(err, conn) {
    conn.query(sql, function(err, datas, fields) {
      if (err) {
        conn.release();
        console.log(err);
        return;
      } else {
        sql = "SELECT DISTINCT garbageid from sensordata order by garbageid ASC";
        conn.query(sql, function(err, devices) {
          if (err) {
            conn.release();
            console.log(err);
            return;
          } else {
            res.render('calendar1', {
              datas: datas,
              devices: devices,
              deviceName : deviceName
            });
            conn.release();
          }
        });
      };
    });
  });
});

app.post('/calendar', function(req, res) {
  var deviceId = req.body.selectbox;
  var sql = "SELECT garbageid, height, date_format(time, '%Y-%m-%d %Hh:%im') as time from sensordata where garbageid = '" + deviceId + "';"
  var deviceName = ['공학 1관 쓰레기통','인문경영관 매점 쓰레기통','대강당 쓰레기통​','본관 교차로 쓰레기통','GEC 인경관 사이 쓰레기통'];
  mysqlPool.getConnection(function(err, conn) {
    if(err) throw err;
    conn.query(sql, function(err, datas, fields) {
      if (err) {
        conn.release();
        console.log(err);
        return;
      } else {
        sql = "SELECT DISTINCT garbageid from sensordata order by garbageid ASC";
        conn.query(sql, function(err, devices) {
          if (err) {
            conn.release();
            console.log(err);
            return;
          } else {
            res.render('calendar2', {
              datas: datas,
              devices: devices,
              deviceName : deviceName
            });
            conn.release();
          }
        });
      }
    });
  });
});


app.post('/daychart', function(req, res) {
  var date = req.body.date;
  var deviceId = req.body.deviceId;
  var sql = "select garbageid, height, date_format(time, '%Hh:%im') as time from sensordata where time >= ? and time < DATE_ADD(?, INTERVAL 1 DAY) and garbageid='"+deviceId+"';";
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
        res.render('daychart', {
          date: datas
        });
        conn.release();
      }
    });
  });
});

app.get(['/report'], function(req, res) {
  var today = "2018-04-28";
  var today2 = "2018-05-04";
  var deviceName = ['공학 1관 쓰레기통','인문경영관 매점 쓰레기통','대강당 쓰레기통​','본관 교차로 쓰레기통','GEC 인경관 사이 쓰레기통'];
  var sql = "select garbageid, height, date_format(time, '%Y-%m-%d %Hh:%im') as t from sensordata where time >= ? and time <= ?;";
  mysqlPool.getConnection(function(err, conn) {
    if(err) throw err;
    conn.query(sql, [today, today2], function(err, datas, fields) {
      if (err) {
        conn.release();
        console.log(err);
        return;
      } else {
        sql = "SELECT DISTINCT garbageid from sensordata order by garbageid ASC";
        conn.query(sql, function(err, device) {
          if (err) {
            conn.release();
            console.log(err);
            return;
          } else {
            res.render('report', {
              datas: datas,
              dates: [today, today2],
              devices: device,
              deviceName : deviceName
            });
            conn.release();
          }
        });
      }
    });
  });
});

app.post(['/report'], function(req, res) {
  var today = "2018-04-28";
  var today2 = "2018-05-04";
  var deviceId = req.body.selectbox;
  var deviceName = ['공학 1관 쓰레기통','인문경영관 매점 쓰레기통','대강당 쓰레기통​','본관 교차로 쓰레기통','GEC 인경관 사이 쓰레기통'];
  var sql = "select garbageid, height, date_format(time, '%Y-%m-%d %Hh:%im') as t from sensordata where time >= ? and time <= ?";
  mysqlPool.getConnection(function(err, conn) {
    if(err) throw err;
    conn.query(sql, [today, today2], function(err, datas, fields) {
      if (err) {
        conn.release();
        console.log(err);
        return;
      } else {
        sql = "SELECT DISTINCT garbageid from sensordata order by garbageid ASC";
        conn.query(sql, function(err, device) {
          if (err) {
            conn.release();
            console.log(err);
            return;
          } else {
            res.render('report2', {
              datas: datas,
              dates: [today, today2],
              devices: device,
              deviceId : deviceId,
              deviceName : deviceName
            });
            conn.release();
          }
        });
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
