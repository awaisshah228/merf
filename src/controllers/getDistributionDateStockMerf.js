const connection = require('../config/connection') // import the connection from the config to the database to make db queries

const getData= (req, res)=>
{    
    const event= req.query

	
	var querystr = "call getDistributionDateStock('" + event.distributionID + "', '" + event.date + "', '" + event.itemType + "')";       
	var querystr = "call getDistributionDateStock('" + event.distributionID + "', '" + event.date + "', '" + event.itemType + "')";       
	connection.query(querystr, function (err2, rowsstr) 
	{
		if (err2 == null)
		{
			// connection.end(function(err11){});
			
			res.json({status: 0, Description: "sucess", data: rowsstr[0]});
		}
		else
		{
			// connection.end(function(err11){});
            res.json({status: 1, Description: "failed", err: err2});

			// context.done(null, {"status": 1, "Description": "failed", "error": err2});
		}
	});
};
module.exports=getData
