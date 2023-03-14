const conn = require("../config/connection"); // import the connection from the config to the database to make db queries

const insert = (req, res,next) => {
  // let event=req.body
  var counter = 0;

  var obj = req.body;
  // console.log(obj,"dsfldsk")
  // if (!obj.length) {
  //   return res.json({ status: 1, Description: "empty input" });
  // }

  // var con = JSON.parse(process.env.con);
  // var conn = mysql.createConnection(con.conn);

  conn.beginTransaction(function (err) {
    if (err) {
       throw err ;
    }

    for (var i = 0; i < obj.length; i++) {
      insertDispenseReports(i);
    }
  });

  var insertDispenseReports = function (m) {
    var querystr1 =
      "INSERT INTO dispensereports (itemID, itemName, unit, type, batchNo, dispensedQuantity, lossQuantity, consumerID, dateCreated, dateModified, hospitalID, totalQuantity) VALUES ('" +
      obj[m].itemID +
      "', '" +
      obj[m].itemName +
      "', '" +
      obj[m].unit +
      "', '" +
      obj[m].type +
      "', '" +
      obj[m].batchNo +
      "', '" +
      obj[m].dispensedQuantity +
      "', '" +
      obj[m].lossQuantity +
      "', '" +
      obj[m].consumerID +
      "', '" +
      obj[m].dateCreated +
      "', '" +
      obj[m].dateModified +
      "', '" +
      obj[m].hospitalID +
      "', '" +
      obj[m].totalQuantity +
      "')";
    conn.query(querystr1, function (err1, rowsstr1) {
      if (err1 == null) {
        var querystr5 =
          "SELECT sum(totalQuantity) As qty FROM itemsstock where hospitalID = " +
          obj[m].hospitalID +
          " AND itemID = " +
          obj[m].itemID +
          ";";
        conn.query(querystr5, function (err5, rowsstr5) {
          if (err5 == null) {
            totalQty = rowsstr5[0].qty;
            openingBalance = totalQty;
            closingBalance = openingBalance - obj[m].totalQuantity;

            var querystr4 =
              "INSERT INTO transactionsregister (transactionID, description, itemID, itemName, unit, type, itemType, quantity, batchNo, expireDate, manufacturer, unitPrice, amount, docType, hospitalID, dispensedQuantity, lossedQuantity, userID, issued, dateCreated, dateModified, openingBalance, closingBalance) VALUES ('" +
              obj[m].dateCreated +
              "', 'CON At " +
              obj[m].hospitalName +
              "', '" +
              obj[m].itemID +
              "', '" +
              obj[m].itemName +
              "', '" +
              obj[m].unit +
              "', '" +
              obj[m].type +
              "', '" +
              obj[m].itemType +
              "', '" +
              obj[m].totalQuantity +
              "', '" +
              obj[m].batchNo +
              "', '" +
              obj[m].expireDate +
              "', 'N.A', '" +
              obj[m].unitPrice +
              "', '" +
              obj[m].unitPrice * obj[m].totalQuantity +
              "', 'CON', '" +
              obj[m].hospitalID +
              "', '" +
              obj[m].dispensedQuantity +
              "', '" +
              obj[m].lossQuantity +
              "', '" +
              obj[m].consumerID +
              "', '" +
              obj[m].totalQuantity +
              "', '" +
              obj[m].dateCreated +
              "', '" +
              obj[m].dateModified +
              "', '" +
              openingBalance +
              "', '" +
              closingBalance +
              "')";
            conn.query(querystr4, function (err4, rowsstr4) {
              if (err4 == null) {
                var querystr3 =
                  "UPDATE itemsstock SET totalQuantity = totalQuantity - " +
                  obj[m].totalQuantity +
                  ", DateModified = '" +
                  obj[m].dateModified +
                  "' where iSID = " +
                  obj[m].isID +
                  ";";
                conn.query(querystr3, function (err3, rowsstr3) {
                  if (err3 == null) {
                    counter++;
                    if (counter == obj.length) {
                      conn.commit(function (err) {
                        if (err) {
                          conn.rollback(function () {
                            next(err);
                          });
                        }
                      });
                      // conn.end(function(err11){});
                      return res.json({ status: 0, Description: "sucess" });
                    }
                  } else {
                    conn.rollback(function () {
                      next(err3);
                    });
                    // conn.end(function(err11){});
                    return res.json({
                      status: 1,
                      Description: "failed at UPDATE ItemsStock",
                      error: err3,
                    });
                  }
                });
              } else {
                conn.rollback(function () {
                  next(err4);
                });
                // conn.end(function(err11){});
                return res.json({
                  status: 1,
                  Description: "failed at TransactionsRegister",
                  error: err4,
                });
              }
            });
          } else {
            conn.rollback(function () {
              next(err5);
            });
            // conn.end(function(err11){});
            return res.json({
              status: 1,
              Description: "failed at sum(totalQuantity) FROM itemsstock",
              error: err5,
            });
          }
        });
      } else {
        conn.rollback(function () {
          next(err1);
        });
        // conn.end(function(err11){});
        res.json({
          status: 1,
          Description: "failed at insert DispenseReports",
          error: err1,
        });
      }
    });
  };
};
module.exports = insert;
