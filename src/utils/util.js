const mongoose = require('mongoose')
const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false 
    if (typeof value === 'string' && value.trim().length === 0) return false 
    return true;
};

const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0; 
};
const isValidEmail = (mail) => {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail))
        return true
};
const isValidPhone = (phone) => {
    if (/^(\+\d{1,3}[- ]?)?\d{10}$/.test(phone))
    return true
};
    const isValidName = (name) => {
        if (/^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/.test(name))
            return true
    };
    const isStreetAddress = (street) => {
        if(/^\d{1,4}[A-Z]?\s([NSEW]\.)?\s(\d{1,3}(st|nd|rd|th))?\s(\w\s)+([A-Z][a-z]{1,3}\.)?/.test(street))
        return true 
    };
    const isCityAddress = (city) => {
        if(/^[A-z]+\s[A-z]+/.test(city))
    return true
};
    const isPincode = (pincode) => {
        if(/^[1-9]{1}[0-9]{2}\\s{0, 1}[0-9]{3}$/.test(pincode))
        return true
    };

module.exports = { isValid, isValidRequestBody,  isValidEmail, isValidPhone, isValidName, isStreetAddress, isCityAddress, isPincode}