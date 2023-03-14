const connection = require('../config/connection') // import the connection from the config to the database to make db queries

const getData = (req, res)=>
{    
    

	// var con = JSON.parse(process.env.con);  
    const event= req.query
	console.log(event)
	
	var querystr = "call getHospitalDateStock('" + event.hospitalID + "', '" + event.date + "', '" + event.itemType + "')";       
	connection.query(querystr, function (err2, rowsstr) 
	{
		if (err2 == null)
		{
			// conn.end(function(err11){});
            res.json({status: 0, Description: "sucess", data: rowsstr[0]});

		}
		else
		{
			// conn.end(function(err11){});
            res.json({status: 1, Description: "failed", err: err2});

			// context.done(null, {"status": 1, "Description": "failed", "error": err2});
		}
	});
};
module.exports=getData
