# Garbage management System using IoT
> 라즈베리파이와 Node.js, Javascript 를 이용한 쓰레기 관리 시스템입니다<br>

교내 쓰레기통의 적재량을 체크하고 이를 관리하는 시스템입니다

## Installing / Getting started

node.js 에서 설치해줘야 할 npm 모듈들

```shell
npm install express --save

npm install body-parser --save

npm install node-mysql --save

npm install ejs --save
```

위의 모듈들을 설치하셨으면 해당 코드를 사용하실 수 있습니다

## Developing

### Built With
> Node.js 8.9.4 (x64)
> ejs template
> bootstrap
> FullCalendar
> Chart.js
> Date Range Picker

### Prerequisites

웹 에디터를 같이 쓰면 좋습니다. 저의 경우 atom을 사용하였습니다<br>
https://atom.io/

node.js에서 소스코드가 변경되었을 때 에플리케이션을 자동으로 재시작해주는 패키지입니다<br>
```
npm install supervisor -g
```


### Setting up Dev

Here's a brief intro about what a developer must do in order to start developing
the project further:

```shell
git clone https://github.com/your/your-project.git
cd your-project/
packagemanager install
```

And state what happens step-by-step. If there is any virtual environment, local server or database feeder needed, explain here.

### Building

If your project needs some additional steps for the developer to build the
project after some code changes, state them here. for example:

```shell
./configure
make
make install
```

Here again you should state what actually happens when the code above gets
executed.

## Api Reference

지도는 daum api를 사용하였습니다. app key 를 발급받아 html 부분에 사용해야 하는데 kakao 계정이 필요합니다<br>
http://apis.map.daum.net/

부트스트랩 프레임워크에서 Dashboard가 포함된 example을 참조하였습니다

https://getbootstrap.com/docs/4.0/examples/dashboard/

날짜를 선택할 때는 Date Ranger Picker 을 사용하였습니다

http://www.daterangepicker.com/

차트를 보여주기 위해 참고한 chart.js library 입니다

http://www.chartjs.org/docs/latest


## Database

MariaDB 10.2 오픈 소스의 관계형 데이터베이스 관리 시스템(RDBMS)
https://downloads.mariadb.org/mariadb/repositories/


