const conn = require("../config/connection"); // import the connection from the config to the database to make db queries
const pad = require("pad-left");

const insert = (req, res, next) => {
  const sr = req.body.sr;
  var counter = 0;
  var counter1 = 0;

  // var sr = event.sr;
  if (!sr) {
    return res.json({ status: 1, Description: "no stock reuest data" });
  }
  if (!sr.sri) {
    return res.json({ status: 1, Description: "no stock items provided" });
  }
  var isSRI = false;
  var isTR = false;

  var performMainTask = function () {
    conn.beginTransaction(function (err) {
      if (err) {
        next(err);
      }

      insertStockRequest();
    });
  };

  var insertStockRequest = function () {
    var querystr1 =
      "INSERT INTO stockrequest (srDate, distributionID, itemType, isConfirmed, isReviewed, DateCreated, DateModified, status, hospitalID, loginID) VALUES ('" +
      sr.srDate +
      "', '" +
      sr.distributionID +
      "', '" +
      sr.itemType +
      "', 0, 0, '" +
      sr.DateCreated +
      "', '" +
      sr.DateModified +
      "', '" +
      sr.status +
      "', '" +
      sr.hospitalID +
      "', '" +
      sr.loginID +
      "')";

    conn.query(querystr1, function (err1, rowsstr1) {
      if (err1 == null) {
        var d = new Date(sr.DateCreated);
        var myYear = d.getFullYear();
        var prnoLong = pad(rowsstr1.insertId, 4, "0");
        var SRCode =
          "MERF - SRF " + sr.hospitalName + " " + myYear + " - " + prnoLong;

        var querystr2 =
          "Update stockrequest Set SRCode = '" +
          SRCode +
          "' Where srID = " +
          rowsstr1.insertId +
          ";";

        conn.query(querystr2, function (err2, rowsstr2) {
          if (err2 == null) {
            counter = counter + sr.sri.length;
            counter1 = counter1 + sr.sri.length;

            for (var j = 0; j < sr.sri.length; j++) {
              insertStockRequestItems(rowsstr1.insertId, j);
              insertTransactionsRegister(rowsstr1.insertId, SRCode, j);
            }
            return res.json({ status: 0, Description: "sucess" });
          } else {
            conn.rollback(function () {
              next(err1);
            });
            // conn.end(function(err11){});
            return res.json({
              status: 1,
              Description: "failed at Update stockrequest",
              error: err2,
            });
          }
        });
      } else {
        conn.rollback(function () {
          next(err1);
        });
        // conn.end(function(err11){});
        return res.json({
          status: 1,
          Description: "failed at INSERT INTO stockrequest",
          error: err1,
        });
      }
    });
  };

  var insertStockRequestItems = function (srID, n) {
    var querystr3 =
      "INSERT INTO stockrequestitems (srID, itemID, itemName, unit, type, requiredQuantity, itemType, DateCreated, DateModified, requestTimeStock, location) VALUES ('" +
      srID +
      "', '" +
      sr.sri[n].itemID +
      "', '" +
      sr.sri[n].itemName +
      "', '" +
      sr.sri[n].unit +
      "', '" +
      sr.sri[n].type +
      "', '" +
      sr.sri[n].requiredQuantity +
      "', '" +
      sr.sri[n].itemType +
      "', '" +
      sr.sri[n].DateCreated +
      "', '" +
      sr.sri[n].DateModified +
      "', '" +
      sr.sri[n].requestTimeStock +
      "', '" +
      sr.sri[n].location +
      "')";
    conn.query(querystr3, function (err3, rowsstr3) {
      if (err3 == null) {
        counter1 = counter1 - 1;
        if (counter1 == 0) {
          isSRI = true;

          if (isTR && isSRI) {
            conn.commit(function (err) {
              if (err) {
                conn.rollback(function () {
                  next(err);
                });
              }
            });
            // conn.end(function(err11){});
            return null, { status: 0, Description: "sucess", srID: srID };
          }
        }
      } else {
        conn.rollback(function () {
          next(err3);
        });
        // conn.end(function(err11){});
        return (
          null,
          { status: 1, Description: "failed at StockRequestItems", error: err3 }
        );
      }
    });
  };

  var insertTransactionsRegister = function (srID, SRCode, n) {
    var querystr5 =
      "SELECT sum(totalQuantity) As qty FROM itemsstock where hospitalID = " +
      sr.hospitalID +
      " AND itemID = " +
      sr.sri[n].itemID +
      ";";
    conn.query(querystr5, function (err5, rowsstr5) {
      if (err5 == null) {
        totalQty = rowsstr5[0].qty;
        openingBalance = totalQty;
        closingBalance = totalQty;
        var d = new Date(sr.DateCreated);

        var querystr4 =
          "INSERT INTO transactionsregister (transactionID, description, itemID, itemName, unit, type, quantity, itemType, docType, hospitalID, userID, dateCreated, dateModified, openingBalance, closingBalance) VALUES ('" +
          SRCode +
          "', '" +
          sr.hospitalName +
          " - " +
          d +
          "', '" +
          sr.sri[n].itemID +
          "', '" +
          sr.sri[n].itemName +
          "', '" +
          sr.sri[n].unit +
          "', '" +
          sr.sri[n].type +
          "', '" +
          sr.sri[n].requiredQuantity +
          "', '" +
          sr.sri[n].itemType +
          "', 'Indent', '" +
          sr.hospitalID +
          "', '" +
          sr.loginID +
          "', '" +
          sr.sri[n].DateCreated +
          "', '" +
          sr.sri[n].DateModified +
          "', '" +
          openingBalance +
          "', '" +
          closingBalance +
          "')";
        conn.query(querystr4, function (err4, rowsstr4) {
          if (err4 == null) {
            counter = counter - 1;
            if (counter == 0) {
              isTR = true;

              if (isTR && isSRI) {
                conn.commit(function (err) {
                  if (err) {
                    conn.rollback(function () {
                      next(err);
                    });
                  }
                });
                // conn.end(function(err11){});
                return null, { status: 0, Description: "sucess", srID: srID };
              }
            }
          } else {
            conn.rollback(function () {
              next(err4);
            });
            // conn.end(function(err11){});
            return (
              null,
              {
                status: 1,
                Description: "failed at TransactionsRegister",
                error: err4,
              }
            );
          }
        });
      } else {
        conn.rollback(function () {
          next(err4);
        });
        // conn.end(function(err11){});
        return (
          null,
          {
            status: 1,
            Description: "failed at sum(totalQuantity) FROM itemsstock",
            error: err5,
          }
        );
      }
    });
  };

  performMainTask();
};
module.exports = insert;
