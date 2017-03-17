$(document).ready(function() {
	//var monthNames = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ]; 
	var monthNames = [ "Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec" ]; 
	var dayNames= ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	//var dayNames = ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"];
	
	function setCurrentTime() { 
		var currentDate = new Date();
		
		var year = currentDate.getFullYear();
		var month = monthNames[currentDate.getMonth()];
		var dayName = dayNames[currentDate.getDay()];
		var day = currentDate.getDate();
		
		var dateString = /*dayName + ", " +*/ month + " " + day + ", " + year;
		
		var timeString = currentDate.toLocaleTimeString();
		
		$('#current_date').html(dateString);
		$('#current_time').html(timeString);
	}
	
	setInterval( setCurrentTime, 1000 ); 
});