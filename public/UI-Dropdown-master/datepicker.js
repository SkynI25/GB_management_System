$(function() {
    $( "#Datepicker" ).datepicker({
      onSelect:function(datatest, inst) {
        var year = inst.selectedYear;
        var month = inst.selectedMonth+1;
        if(month<10) month = "0"+month;
        var day = inst.selectedDay;
        if(day<10) day = "0"+day;
        var date = year+'-'+month+'-'+day;
        window.location="/list?date="+date;
      }
    });
});
