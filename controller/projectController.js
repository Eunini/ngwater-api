const { FormStageA } = require("../models/stageA.model");
const { FormStageB } = require("../models/stageB.model");
const { FormStageC } = require("../models/stageC.model");

const { saveFile, deleteFile } = require("./fileController");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

// Create a new form (Stage A)
exports.createForm = async (req, res) => {
  try {
    const form = await FormStageA.create({
      ...req.body,
      userId: req.user.id,
    });

    res.status(201).json(form);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create form" });
  }
};

// Update Stage A
exports.updateStageA = async (req, res) => {
  try {
    const form = await FormStageA.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!form) {
      return res.status(404).json({ error: "Form not found" });
    }

    const updatedForm = await form.update(req.body);
    res.json(updatedForm);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update form" });
  }
};

// Create/Update Stage B
exports.updateStageB = async (req, res) => {
  try {
    const stageA = await FormStageA.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!stageA) {
      return res.status(404).json({ error: "Stage A not found" });
    }

    let stageB = await FormStageB.findOne({
      where: { formStageAId: req.params.id },
    });

    if (stageB) {
      stageB = await stageB.update(req.body);
    } else {
      stageB = await FormStageB.create({
        ...req.body,
        formStageAId: req.params.id,
        userId: req.user.id,
      });
    }

    res.json(stageB);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update Stage B" });
  }
};

// Create/Update Stage C with file uploads
exports.updateStageC = async (req, res) => {
  try {
    const stageB = await FormStageB.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!stageB) {
      return res.status(404).json({ error: "Stage B not found" });
    }

    // Process file uploads
    const files = req.files;
    const filePaths = {};

    if (files.labTestCertificate) {
      filePaths.labTestCertificatePath = await saveFile(
        files.labTestCertificate[0],
        "certificates"
      );
    }

    if (files.rawLabSheet) {
      filePaths.rawLabSheetPath = await saveFile(
        files.rawLabSheet[0],
        "labsheets"
      );
    }

    if (files.samplingPointPhotos) {
      const photos = await Promise.all(
        files.samplingPointPhotos.map((file) =>
          saveFile(file, "sampling-photos")
        )
      );
      filePaths.samplingPointPhotosPaths = photos;
    }

    // Check if Stage C already exists
    let stageC = await FormStageC.findOne({
      where: { formStageBId: req.params.id },
    });

    if (stageC) {
      // Update existing Stage C
      stageC = await stageC.update({
        ...req.body,
        ...filePaths,
      });
    } else {
      // Create new Stage C
      stageC = await FormStageC.create({
        ...req.body,
        ...filePaths,
        formStageBId: req.params.id,
        userId: req.user.id,
      });
    }

    res.json(stageC);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update Stage C" });
  }
};

// Submit final form
exports.submitForm = async (req, res) => {
  try {
    const stageC = await FormStageC.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!stageC) {
      return res.status(404).json({ error: "Form not found" });
    }

    // Validate all required fields are completed
    if (stageC.status !== "completed") {
      return res.status(400).json({ error: "Form is not completed" });
    }

    // Update status to submitted
    const updatedForm = await stageC.update({ status: "submitted" });

    // Here you could add notification logic, etc.

    res.json(updatedForm);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to submit form" });
  }
};

// Get form by ID
exports.getForm = async (req, res) => {
  try {
    const form = await FormStageA.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [
        {
          model: FormStageB,
          as: "stageB",
          required: false,
        },
        {
          model: FormStageC,
          as: "stageC",
          required: false,
        },
      ],
    });

    if (!form) {
      return res.status(404).json({ error: "Form not found" });
    }

    res.json(form);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get form" });
  }
};
