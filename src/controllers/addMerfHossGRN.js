const conn = require("../config/connection"); // import the connection from the config to the database to make db queries
const pad = require('pad-left');

const insert = (req, res, next) => {
  var grn = req.body.grn;
  var grnID;
  var GRNCode;
  // if(!grn){
  //   return res.json({
  //     status: 1,
  //     Description: "no grn ",
  //     // error: err2,
  //   });
  // }

  var counter = 0;

  var performMainTask = function () {
    conn.beginTransaction(function (err) {
      if (err) {
        next(err);
      }

      var querystr1 =
        "INSERT INTO hosgrn (recieveDate, poID, hospitalID, isConfirmed, DateCreated, DateModified, isReviewed, status, totalRecieved) VALUES ('" +
        grn?.recieveDate +
        "', '" +
        grn?.poID +
        "', '" +
        grn?.hospitalID +
        "', '" +
        grn?.isConfirmed +
        "', '" +
        grn?.DateCreated +
        "', '" +
        grn?.DateModified +
        "', '" +
        grn?.isReviewed +
        "', '" +
        grn?.status +
        "', " +
        grn?.totalRecieved +
        ")";
      conn.query(querystr1, function (err1, rowsstr1) {
        console.log(err1,"djflsjlfj")
        if (err1 == null) {
          grnID = rowsstr1.insertId;
          var d = new Date(grn.DateCreated);
          var myYear = d.getFullYear();
          var prnoLong = pad(grnID, 4, "0");
          GRNCode =
            "MERF - HOS GRN - " +
            grn.hospitalName +
            " - " +
            myYear +
            " - " +
            prnoLong;

          var querystr2 =
            "Update hosgrn Set GRNCode = '" +
            GRNCode +
            "' Where grnID = " +
            grnID +
            ";";

          conn.query(querystr2, function (err2, rowsstr2) {
            if (err2 == null) {
              counter = grn.grni.length;
              for (var j = 0; j < grn.grni.length; j++) {
                insertHosGRNItems(j);
              }

              if (grn.isGRNComplete == 1) {
                updateIssuedStock();
              }

              return res.json({ status: 0, Description: "sucess" });
            } else {
              conn.rollback(function () {
                next(err2);
              });
              //   conn.end(function (err11) {});
              return res.json({
                status: 1,
                Description: "failed at Update hosgrn",
                error: err2,
              });
            }
          });
        } else {
          conn.rollback(function () {
            next(err1);
          });
          //   conn.end(function (err11) {});
          return res.json({
            status: 1,
            Description: "failed at INSERT INTO hosgrn",
            error: err1,
          });
        }
      });
    });
  };

  var insertHosGRNItems = function (j) {
    var querystr3 =
      "INSERT INTO hosgrnitems (grnID, itemID, itemName, unit, type, itemType, recievedQuantity, expireDate, amount, manufacturer, batchNo, YearOfManufecture, DateCreated, DateModified, discrepency) VALUES ('" +
      grnID +
      "', '" +
      grn.grni[j].itemID +
      "', '" +
      grn.grni[j].itemName +
      "', '" +
      grn.grni[j].unit +
      "', '" +
      grn.grni[j].type +
      "', '" +
      grn.grni[j].itemType +
      "', '" +
      grn.grni[j].recievedQuantity +
      "', '" +
      grn.grni[j].expireDate +
      "', '" +
      grn.grni[j].amount +
      "', '" +
      grn.grni[j].manufacturer +
      "', '" +
      grn.grni[j].batchNo +
      "', '" +
      grn.grni[j].YearOfManufecture +
      "', '" +
      grn.DateCreated +
      "', '" +
      grn.DateModified +
      "', '" +
      grn.grni[j].discrepency +
      "')";
    conn.query(querystr3, function (err3, rowsstr3) {
      if (err3 == null) {
        var querystr12 =
          "SELECT sum(totalQuantity) As qty FROM itemsstock where hospitalID = " +
          grn.hospitalID +
          " AND itemID = " +
          grn.grni[j].itemID +
          ";";
        conn.query(querystr12, function (err12, rowsstr12) {
          if (err12 == null) {
            totalQty = rowsstr12[0].qty;
            openingBalance = totalQty;
            closingBalance = openingBalance + grn.grni[j].recievedQuantity;
            var d = new Date(grn.DateCreated);

            var querystr4 =
              "INSERT INTO transactionsregister (transactionID, description, itemID, itemName, unit, type, quantity, batchNo, expireDate, manufacturer, unitPrice, amount, received, itemType, docType, hospitalID, userID, dateCreated, dateModified, openingBalance, closingBalance) VALUES ('" +
              GRNCode +
              "', 'At " +
              grn.hospitalName +
              "', '" +
              grn.grni[j].itemID +
              "', '" +
              grn.grni[j].itemName +
              "', '" +
              grn.grni[j].unit +
              "', '" +
              grn.grni[j].type +
              "', '" +
              grn.grni[j].recievedQuantity +
              "', '" +
              grn.grni[j].batchNo +
              "', '" +
              grn.grni[j].expireDate +
              "', '" +
              grn.grni[j].manufacturer +
              "', '" +
              grn.grni[j].amount +
              "', '" +
              grn.grni[j].recievedQuantity * grn.grni[j].amount +
              "', '" +
              grn.grni[j].recievedQuantity +
              "', '" +
              grn.grni[j].itemType +
              "', 'HF GRN', '" +
              grn.hospitalID +
              "', '" +
              grn.userID +
              "', '" +
              grn.DateCreated +
              "', '" +
              grn.DateModified +
              "', '" +
              openingBalance +
              "', '" +
              closingBalance +
              "')";
            conn.query(querystr4, function (err4, rowsstr4) {
              if (err4 == null) {
                var querystr5 =
                  "SELECT * FROM itemsstock WHERE itemID = '" +
                  grn.grni[j].itemID +
                  "' AND hospitalID = '" +
                  grn.hospitalID +
                  "' AND grnID = '" +
                  grn.grni[j].grnID +
                  "';";
                conn.query(querystr5, function (err5, rowsstr5) {
                  if (err5 == null) {
                    if (rowsstr5.length > 0) {
                      var querystr6 =
                        "UPDATE itemsstock SET totalQuantity = totalQuantity + " +
                        grn.grni[j].recievedQuantity +
                        ", DateModified = '" +
                        grn.DateModified +
                        "' WHERE iSID = '" +
                        rowsstr5[0].iSID +
                        "';";
                      conn.query(querystr6, function (err6, rowsstr6) {
                        if (err6 == null) {
                          counter = counter - 1;
                          if (counter == 0) {
                            conn.commit(function (err) {
                              if (err) {
                                conn.rollback(function () {
                                  next(err);
                                });
                              }
                            });
                            // conn.end(function (err11) {});
                            return (
                              null,
                              {
                                status: 0,
                                Description: "sucess",
                                grnID: grnID,
                                GRNCode: GRNCode,
                              }
                            );
                          }
                        } else {
                          conn.rollback(function () {
                            next(err6);
                          });
                          //   conn.end(function (err11) {});
                          return (
                            null,
                            {
                              status: 1,
                              Description: "failed at UPDATE ItemsStocks",
                              error: err6,
                            }
                          );
                        }
                      });
                    } else {
                      var querystr7 =
                        "INSERT INTO itemsstock (itemID, itemName, unit, type, itemType, totalQuantity, expireDate, unitPrice, hospitalID, issuedStockID, Make, grnID, batchNo, YearOfManufecture, DateCreated, DateModified) VALUES ('" +
                        grn.grni[j].itemID +
                        "', '" +
                        grn.grni[j].itemName +
                        "', '" +
                        grn.grni[j].unit +
                        "', '" +
                        grn.grni[j].type +
                        "', '" +
                        grn.grni[j].itemType +
                        "', '" +
                        grn.grni[j].recievedQuantity +
                        "', '" +
                        grn.grni[j].expireDate +
                        "', '" +
                        grn.grni[j].amount +
                        "', '" +
                        grn.hospitalID +
                        "', '" +
                        grn.poID +
                        "', '" +
                        grn.grni[j].manufacturer +
                        "', '" +
                        grn.grni[j].grnID +
                        "', '" +
                        grn.grni[j].batchNo +
                        "', '" +
                        grn.grni[j].YearOfManufecture +
                        "', '" +
                        grn.DateCreated +
                        "', '" +
                        grn.DateModified +
                        "')";
                      conn.query(querystr7, function (err7, rowsstr7) {
                        if (err7 == null) {
                          counter = counter - 1;
                          if (counter == 0) {
                            conn.commit(function (err) {
                              if (err) {
                                conn.rollback(function () {
                                  next(err);
                                });
                              }
                            });
                            // conn.end(function (err11) {});
                            return (
                              null,
                              {
                                status: 0,
                                Description: "sucess",
                                grnID: grnID,
                                GRNCode: GRNCode,
                              }
                            );
                          }
                        } else {
                          conn.rollback(function () {
                            next(err7);
                          });
                          //   conn.end(function (err11) {});
                          return (
                            null,
                            {
                              status: 1,
                              Description: "failed at INSERT INTO itemsstock",
                              error: err7,
                            }
                          );
                        }
                      });
                    }
                  } else {
                    conn.rollback(function () {
                      next(err5);
                    });
                    // conn.end(function (err11) {});
                    return (
                      null,
                      {
                        status: 1,
                        Description: "failed at SELECT * FROM ItemsStocks",
                        error: err5,
                      }
                    );
                  }
                });
              } else {
                conn.rollback(function () {
                  next(err4);
                });
                // conn.end(function (err11) {});
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
              next(err12);
            });
            // conn.end(function (err11) {});
            return (
              null,
              {
                status: 1,
                Description: "failed at sum(totalQuantity) FROM itemsstock",
                error: err12,
              }
            );
          }
        });
      } else {
        conn.rollback(function () {
          next(err3);
        });
        // conn.end(function (err11) {});
        return (
          null,
          {
            status: 1,
            Description: "failed at HosGRNItems",
            error: err3,
          }
        );
      }
    });
  };
  var updateIssuedStock = function () {
    var querystr11 =
      "UPDATE issuedstock SET isReviewed = " +
      grn.isGRNComplete +
      ", DateModified = '" +
      grn.DateModified +
      "' WHERE istID = '" +
      grn.poID +
      "';";
    conn.query(querystr11, function (err11, rowsstr11) {
      if (err11 == null) {
        return;
      } else {
        conn.rollback(function () {
          next(err11);
        });
        // conn.end(function (err11) {});
        return (
          null,
          {
            status: 1,
            Description: "failed at UPDATE IssuedStock",
            error: err11,
          }
        );
      }
    });
  };

  performMainTask();
};

module.exports=insert
