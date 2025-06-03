const bcrypt = require('bcrypt');
const nodeMailer = require('nodemailer');
const moment = require('moment');
const LeadModel = require('../Models/LeadModel.js')

exports.createLead = async (req, res) => {
    // console.log('10');
    try {
        console.log("createleadreq.body=" + req.body);
        // console.log(req.body.content);
        const { leadName, contactNumber, email, address, assignedTo, nextfollowupdate, nextfollowuptime, conversionDate, leadSource, customerType, leadNotes, purchaseHistory, medicalNeeds } = req.body;
        // console.log("leadname" + leadname); console.log("email" + email); console.log("contactNumber")
        if (!(leadName && email && contactNumber && address)) { return res.status(404).json({ message: "Name, Email, Password, address fields are Mandatory." }) }
        console.log(LeadModel);
        const leadEmail = await LeadModel.findOne({ email })
        console.log(leadEmail);
        if (leadEmail) { return res.status(400).json({ message: "email already exist" }) }

        let data;
        console.log(`data123=`, data);
        console.log(typeof (contactNumber))
        console.log(req.user._id);
        console.log("address" + address);
        console.log("nextfollowupdate, nextfollowuptime, conversionDate, leadSource, customerType" + nextfollowupdate, nextfollowuptime, conversionDate, leadSource, customerType);
        console.log("purchaseHistory, medicalNeeds" + purchaseHistory, medicalNeeds);
        console.log("leadNotes" + leadNotes);
        console.log("assignedTo" + assignedTo);
        console.log("assignedTo,leadNotes" + assignedTo, leadNotes);
        data = { leadName, email, contactNumber, address, assignedTo, nextfollowupdate, nextfollowuptime, conversionDate, leadSource, customerType, leadNotes, purchaseHistory, medicalNeeds };
        console.log('data=' + data);
        if (conversionDate != null) { data.status = "Converted"; }
        else if (!!(nextfollowupdate && nextfollowuptime)) { data.status = "InProgress"; }
        if (data.assignedTo && typeof data.assignedTo === 'object') {
            data.assignedTo = data.assignedTo.value;
        }

        console.log(`>>>>>>>>data>>>>>`, data);
        if (!data) { return res.status(404).json({ message: 'no data' }) }
        const leads = new LeadModel(data);
        console.log(`>>>>>>>>user>>>>>>`, leads)
        if (!leads) { return res.status(404).json({ message: 'lead data not received' }) }

        await leads.save();
        res.status(200).json(leads);
    }
    catch (err) { return res.status(500).json({ message: "internal server error" }) }

}

exports.UpdateLead = async (req, res) => {
    const { id } = req.params;
    const data = req.body
    console.log(id)

    if (!id) { return res.status(404).json({ error: "ID IS REQUIRED!!!" }) }

    if (data.conversionDate != null) { data.status = "Converted"; }
    else if (!!(data.nextfollowupdate && data.nextfollowuptime)) { data.status = "InProgress"; }
    else { data.status = "New"; }
    const newAssignedTo = (
        typeof req.body.assignedTo === 'object' &&
        req.body.assignedTo.value
    )
        ? req.body.assignedTo.value
        : req.body.assignedTo;
    data.assignedTo = newAssignedTo;
    const lead = await LeadModel.findByIdAndUpdate(id, data)
    if (!lead) { return res.status(404).json({ error: "record not found" }); }
    res.status(200).json(lead)
}

exports.getAllLeads = async (req, res) => {
    // console.log(`>>>>>>>>>11`);
    try {
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Access denied' });
        }
        const leads = await LeadModel.find().sort({ createdAt: -1 });
        console.log(`>>>>>>>>>28>>>leads>>>>>>>.`, leads);
        console.log("===========================================");

        if (leads) { res.status(200).json(leads); }
        else res.status(404).json({ message: "leads not found" });
    } catch (error) { res.status(500).json({ message: 'Server error' }); }
}

exports.getLead = async (req, res) => {
    const leads = await LeadModel.findById(req.params.id);
    res.status(200).json(leads);
}

exports.getLeadsByUserId = async (req, res) => {
    if (!req.user._id.equals(req.params.id) && req.user.role !== 'Admin') {
        return res.status(403).json({ message: "Access Denied." });
    }
    const leads = await LeadModel.find({ assignedTo: req.user._id });
    console.log(`>>>>>>>>>28>>>>getLeadsByUserId>>>>>>.`, leads);
    if (leads) { res.status(200).json(leads); }
    else res.status(404).json({ message: "Leads not found" });
}

exports.softdelete = async (req, res) => {
    const { id } = req.params;
    console.log(id);
    if (!id) return res.status(403).json({ message: "Access Denied." });
    const Leads = await LeadModel.findByIdAndUpdate(id, { status: 'Closed' }, { new: true });
    console.log(`>>>>>>Leads:`, Leads);
    res.status(200).json(Leads);
}

exports.deleteLead = async (req, res) => {
    //Hard Delete
    console.log(`>>>>>>>>36>>>>>>>>`, req.params.id);
    const Leads = await LeadModel.findByIdAndDelete({ _id: req.params.id });
    console.log(Leads);
    res.status(200).json(Leads);
}

