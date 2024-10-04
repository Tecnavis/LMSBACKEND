const Modal = require('../Model/notes')

//create notes
exports.create = async (req, res) => {
    const {priority, description, title, date, name} = req.body
    try {
        const note = await Modal.create({
            priority,
            description,
            title,
            name,
            date

        });
        res.status(201).json(note);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

//get all notes
exports.getAll = async (req, res) => {
    try {
        const notes = await Modal.find();
        res.status(200).json(notes);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

//get by id
exports.getById = async (req, res) => {
    try {
        const note = await Modal.findById(req.params.id);
        if (!note) return res.status(404).json({ message: "Note not found" });
        res.status(200).json(note);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}


//delete by id  
exports.delete = async (req, res) => {
    try {
        const note = await Modal.findByIdAndDelete(req.params.id);
        if (!note) return res.status(404).json({ message: "Note not found" });
        res.status(200).json({ message: "Note deleted" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

//update by id  
exports.update = async (req, res) => {
    try {
        const note = await Modal.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!note) return res.status(404).json({ message: "Note not found" });
        res.status(200).json(note);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}