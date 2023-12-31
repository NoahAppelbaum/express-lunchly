"use strict";

/** Routes for Lunchly */

const express = require("express");

const { BadRequestError } = require("./expressError");
const Customer = require("./models/customer");
const Reservation = require("./models/reservation");
const moment = require("moment")

const router = new express.Router();


/** Homepage: show list of customers. On search, show search results */

router.get("/", async function (req, res, next) {
  let customers;
  if (req.query.search){
     customers = await Customer.find(req.query.search);
  } else {
     customers = await Customer.all();
  }
  console.log(`customers are `, customers);
  return res.render("customer_list.html", { customers });
});

/** Form to add a new customer. */

router.get("/add/", async function (req, res, next) {
  return res.render("customer_new_form.html");
});

/** Handle adding a new customer. */

router.post("/add/", async function (req, res, next) {
  if (req.body === undefined) {
    throw new BadRequestError();
  }
  const { firstName, lastName, phone, notes } = req.body;
  const customer = new Customer({ firstName, lastName, phone, notes });
  await customer.save();

  return res.redirect(`/${customer.id}/`);
});

/** Show top 10 customers, by reservations */

router.get("/top-ten", async function (req, res, next) {

  const customers = await Customer.getTopTen();

  return res.render("customer_topten.html", { customers });
});

/** Show a customer, given their ID. */

router.get("/:id/", async function (req, res, next) {
  const customer = await Customer.get(req.params.id);

  const reservations = await customer.getReservations();

  return res.render("customer_detail.html", { customer, reservations });
});

/** Show form to edit a customer. */

router.get("/:id/edit/", async function (req, res, next) {
  const customer = await Customer.get(req.params.id);

  res.render("customer_edit_form.html", { customer });
});

/** Handle editing a customer. */

router.post("/:id/edit/", async function (req, res, next) {
  if (req.body === undefined) {
    throw new BadRequestError();
  }
  const customer = await Customer.get(req.params.id);
  customer.firstName = req.body.firstName;
  customer.lastName = req.body.lastName;
  customer.phone = req.body.phone;
  customer.notes = req.body.notes;
  await customer.save();

  return res.redirect(`/${customer.id}/`);
});

/** Handle adding a new reservation. */

router.post("/:id/add-reservation/", async function (req, res, next) {
  if (req.body === undefined) {
    throw new BadRequestError();
  }
  const customerId = req.params.id;
  const startAt = new Date(req.body.startAt);
  const numGuests = req.body.numGuests;
  const notes = req.body.notes;

  if (startAt.toString() === "Invalid Date"){
    throw new BadRequestError("Please enter a valid date and time");
  }

  const reservation = new Reservation({
    customerId,
    startAt,
    numGuests,
    notes,
  });
  await reservation.save();

  return res.redirect(`/${customerId}/`);
});

router.get("/reservations/:id", async function(req,res) {
  const id = req.params.id
  const reservation = await Reservation.get(id)
  console.log(`Our reservation is `, reservation)
  return res.render("reservation_edit_form.html", { reservation });
})

router.post("/reservations/:id", async function (req,res){
  if (req.body === undefined) {
    throw new BadRequestError();
  }
  const reservation = await Reservation.get(req.params.id);
  reservation.startAt = new Date(req.body.startAt);
  reservation.numGuests = req.body.numGuests;
  reservation.notes = req.body.notes;
  console.log(`Edited reservation is `, reservation)
  await reservation.save();

  return res.redirect(`/${reservation.customerId}/`);
})

module.exports = router;
