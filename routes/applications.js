const express = require('express')
const router = express.Router()
const Application = require('../models/Application')
const credentials = require("../creds");
const nodemailer = require('nodemailer')
const moment = require('moment'); // require

const noreplyEmail = {
    user: credentials.noreplyEmail.user,
    password: credentials.noreplyEmail.password
}

router.post('/submit', (req, res) => {
    if (isValidMessage(req.body)) {
        const application = new Application({
            email: req.body.email,
            name: req.body.name,
            nickname: req.body.nickname == "" ? null : req.body.nickname,
            discordName: req.body.discordName,
            position: req.body.position,
            message: req.body.message,
            date: new Date(Date.now()).getTime()
        })
        application.save()
            .then(data => {
                res.json(data)
                sendEmail(req.body, noreplyEmail, req.body.email)
                sendEmail(req.body, noreplyEmail, "admin@inceptioncloud.net")
            })
            .catch(err => {
                console.log(err, "error")
                if (err._message == 'Candidature validation failed') {
                    res.status(422);
                    res.json({ status: 422, message: "Bitte fülle alle Lücken." })
                }
            })
    } else {
        res.status(422);
        res.json({
            status: 422,
            message: "Bitte fülle alle Lücken.",
        });
    }
})

function sendEmail(details, sender, receiver) {
    if (receiver !== "admin@inceptioncloud.net") {
        let position
        if (details.position == 'mc-server-dev') {
            position = 'Minecraft Server Developer'
        } else if (details.position == 'mc-client-dev') {
            position = 'Minecraft Client Developer'
        }
        const outputText = `
        <h1>Schön, dass du Interesse hast mit uns zu arbeiten!</h1>
        <p>Wir freuen uns, dass du dich bei uns als ${position} beworben hast. 
        Sobald sich der Status deiner Bewerbung ändert, wirst du über die E-Mail-Adresse ${details.email} benachrichtigt!</p>`;

        const outputHTML = `
        <h1>Schön, dass du Interesse hast mit uns zu arbeiten!</h1>
        <p>Wir freuen uns, dass du dich bei uns als ${position} beworben hast. 
        Sobald sich der Status deiner Bewerbung ändert, wirst du über die E-Mail-Adresse ${details.email} benachrichtigt!</p>`;

        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            pool: true,
            host: 'cmail01.mc-host24.de',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: sender.user, // generated ethereal user
                pass: sender.password // generated ethereal password
            }
        });

        // setup email data with unicode symbols
        let mailOptions = {
            from: `"Inception Cloud" ${sender.user}`, // sender address
            to: receiver, // list of receivers
            subject: 'Bewerbung', // Subject line
            text: outputText,
            html: outputHTML // html body
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('NO-REPLY')
            console.log(moment().format('MMMM Do YYYY, h:mm:ss a') + " | " + 'Message sent: ', info.messageId);
            console.log(moment().format('MMMM Do YYYY, h:mm:ss a') + " | " + 'Preview URL: ', nodemailer.getTestMessageUrl(info));
        });
    } else {
        const outputText = `Eine Bewerbung ist eingegangen!
                            E-Mail-Adresse: ${details.email}
                            Name: ${details.name}
                            Nickname: ${details.name == "" ? null : details.name}
                            Rolle/Job: ${details.position}
                            Nachricht: ${details.message}`;

        const outputHTML = `
        <h2>Eine Bewerbung ist eingegangen!</h2>
        <ul>
            <li><strong>E-Mail-Adresse:</strong> ${details.email}</li>
            <li><strong>Name:</strong> ${details.name}</li>
            <li><strong>Nickname:</strong> ${details.nickname == "" ? null : details.nickname}</li>
            <li><strong>Position:</strong> ${details.position}</li>
        </ul>
            <h4>Nachricht:</h4> ${details.message}`;
        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            pool: true,
            host: 'cmail01.mc-host24.de',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: sender.user, // generated ethereal user
                pass: sender.password // generated ethereal password
            }
        });

        // setup email data with unicode symbols
        let mailOptions = {
            from: '"Inception Cloud" <admin@inceptioncloud.net', // sender address
            to: receiver, // list of receivers
            subject: 'Bewerbung', // Subject line
            text: outputText,
            html: outputHTML // html body
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('ADMIN')
            console.log(moment().format('MMMM Do YYYY, h:mm:ss a'), 'Message sent: %s', info.messageId);
            console.log(moment().format('MMMM Do YYYY, h:mm:ss a'), 'Preview URL: %s', nodemailer.getTestMessageUrl(info));
        });
    }
}

function isValidMessage(app) {
    return (
        app.message &&
        app.message.toString().trim() !== "" &&
        app.message.toString().replace(/(<([^>]+)>)/ig, "") !== ""
    );
}

module.exports = router