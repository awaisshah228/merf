const conn = require("../config/connection"); // import the connection from the config to the database to make db queries

const getReport = function (req, res,next) {
    // var mysql = require('mysql');
    // var AWS = require('aws-sdk');
    // AWS.config.region = 'us-east-1';
    
	// var con = JSON.parse(process.env.con);
	// var conn = mysql.createConnection(con.conn);
	const event=req.query
	
	var locationType = event.locationType;
	var wareHouseID = event.wareHouseID;
    var hospitalID = event.hospitalID;
    var fromDate = event.fromDate;
    var toDate = event.toDate;
    var itemID = event.itemID;
	
	var data = [];
	var openingBalance;
	var totalReceived;
	var totalIssued;
	var closingBalance = 0;
	
	var count = 0, total = 3;
	
	getData();
	getTotalReceivedIssued();
	getClosingBalance();

	return res.json({openingBalance,closingBalance,totalReceived,totalIssued,data})
	
	function getData()
	{
		var querystr = 
			"select * from transactionsregister" +
			" where if(" + locationType + " = 0, wareHouseID = " + wareHouseID + 
			", hospitalID = " + hospitalID + ")" +
			" and date(DateCreated) >= '2018-12-01'" + 
			" and (received > 0 || issued > 0)" +
			" and date(dateCreated) >= '" + fromDate + 
			"' and date(dateCreated) <= '" + toDate +
			"' and itemID = " + itemID + 
			//";";
			" order by date(dateCreated), id;";
		conn.query(querystr, function (err, rowsstr) 
		{
			if (err == null)
			{
				data = rowsstr;
				if(data.length > 0)
				{
					//if(data[0].dateCreated.toLocaleDateString() == data[0].dateModified.toLocaleDateString())
					//{
						count++;
						openingBalance = data[0].openingBalance;
						
						if(count == total)
							final();
					/*}
					else
					{
						getOpeningBalance();
					}*/
				}
				else
				{
					// conn.end(function(err11){});
					return(null, {"status": 0, "Description": "success", "data": data});
				}
			}
			else
			{
				// conn.end(function(err11){});
				return(null, {"status": 1, "Description": "failed", "error": err});
			}
		});
	}
	
	function getTotalReceivedIssued()
	{
		var querystr = 
			"select sum(received) received, sum(issued) issued from transactionsregister" +
			" where if(" + locationType + " = 0, wareHouseID = " + wareHouseID + ", hospitalID = " + hospitalID + ")" +
			" and date(DateCreated) >= '2018-12-01' and (received > 0 || issued > 0)" +
			" and date(dateCreated) >= '" + fromDate + "' and date(dateCreated) <= '" + toDate +
			"' and itemID = " + itemID + ";";
		
		conn.query(querystr, function (err, rowsstr) 
		{
			if (err == null)
			{
				count++;
				totalReceived = rowsstr[0].received;
				totalIssued = rowsstr[0].issued;
				//openingBalance = closingBalance + totalIssued - totalReceived;
				
				if(count == total)
					final();
			}
			else
			{
				// conn.end(function(err11){});
				return(null, {"status": 1, "Description": "failed", "error": err});
			}
		});
	}
	
	function final()
	{
		var closingBalance1 = openingBalance + totalReceived - totalIssued;
		console.log('closingBalance: ' + closingBalance);
		
		if(closingBalance1 != closingBalance)
			openingBalance = closingBalance - totalReceived + totalIssued;
		
		data[0].openingBalance = openingBalance;
		data[0].closingBalance = data[0].openingBalance + data[0].received - data[0].issued;
		
		if(data[0].expireDate == '0000-00-00 00:00:00')
			data[0].expireDate = '0001-01-01 00:00:00';
		
		for (var i = 1; i < data.length; i++) 
		{
			data[i].openingBalance = data[i-1].closingBalance;
			data[i].closingBalance = data[i].openingBalance + data[i].received - data[i].issued;
			
			if(data[i].expireDate == '0000-00-00 00:00:00')
				data[i].expireDate = '0001-01-01 00:00:00';
				
			if(data[i].closingBalance < 0)
				console.log('id: ' + data[i].id);
		}
		
		// conn.end(function(err11){});
		return(null, {"status": 0, "Description": "success", "data": data});
	}
	
	/*function getOpeningBalance()
	{
		var querystr = 
			"select openingBalance, sum(received) as received, sum(issued) as issued from transactionsregister" +
			" where if(" + locationType + " = 0, wareHouseID = " + wareHouseID + ", hospitalID = " + hospitalID + ")" +
			" and date(dateCreated) >= (" +
				"select date(dateCreated) from transactionsregister" +
				" where if(" + locationType + " = 0, wareHouseID = " + wareHouseID + ", hospitalID = " + hospitalID + ")" +
				" and date(DateCreated) >= '2018-12-01' and (received > 0 || issued > 0)" +
				" and date(dateCreated) < '" + fromDate + "' and itemID = " + itemID +
				" and date(dateCreated) = date(dateModified) order by id desc limit 1" +
			")" +
			"and date(dateCreated) < '" + fromDate + "' and itemID = " + itemID + ";";
				
		conn.query(querystr, function (err, rowsstr) 
		{
			if (err == null)
			{
				count++;
				if(rowsstr.length>0)
				{
					openingBalance = rowsstr[0].openingBalance + rowsstr[0].received - rowsstr[0].issued;
				}
				else
				{
					openingBalance = data[0].openingBalance;
				}
				
				if(count == total)
					final();
			}
			else
			{
				conn.end(function(err11){});
				context.done(null, {"status": 1, "Description": "failed", "error": err});
			}
		});
	}*/
	
	function getClosingBalance()
	{
		var querystr = 
			"select closingBalance from transactionsregister" +
			" where if(" + locationType + " = 0, wareHouseID = " + wareHouseID + ", hospitalID = " + hospitalID + ") " +
			" and date(dateCreated) >= '" + fromDate + "' and date(dateCreated) <= '" + toDate + "' and itemID = " + itemID + 
			" order by date(dateCreated) desc, id desc Limit 1;";
			
		conn.query(querystr, function (err, rowsstr) 
		{
			if (err == null)
			{
				count++;
				if(rowsstr.length>0)
					closingBalance = rowsstr[0].closingBalance;

				if(count == total)
					final();
				//getTotalReceivedIssued();
			}
			else
			{
				// conn.end(function(err11){});
				return(null, {"status": 1, "Description": "failed", "error": err});
			}
		});
	}
};
module.exports=getReport