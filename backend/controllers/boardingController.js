const Boarding = require('../models/Boarding');

// @desc    Create a new boarding listing
// @route   POST /api/boardings
// @access  Public (Should be private in production, but public for dev/test)
exports.createBoarding = async (req, res) => {
  try {
    const boardingData = req.body;

    if (!boardingData.owner) {
      return res.status(400).json({ success: false, message: 'Owner identifier is required' });
    }

    const boarding = await Boarding.create(boardingData);
    
    res.status(201).json({
      success: true,
      boarding,
    });
  } catch (error) {
    console.error('Error creating boarding:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all boarding listings, optionally filtered by owner
// @route   GET /api/boardings
// @access  Public
exports.getBoardings = async (req, res) => {
  try {
    const { owner } = req.query;
    
    let query = {};
    if (owner) {
      query.owner = owner.toLowerCase();
    }

    const boardings = await Boarding.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: boardings.length,
      boardings,
    });
  } catch (error) {
    console.error('Error fetching boardings:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a boarding listing
// @route   DELETE /api/boardings/:id
// @access  Public
exports.deleteBoarding = async (req, res) => {
  try {
    const boarding = await Boarding.findById(req.params.id);

    if (!boarding) {
      return res.status(404).json({ success: false, message: 'Boarding listing not found' });
    }

    await Boarding.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Boarding listing deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting boarding:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a boarding listing
// @route   PUT /api/boardings/:id
// @access  Public
exports.updateBoarding = async (req, res) => {
  try {
    const boardingData = req.body;
    let boarding = await Boarding.findById(req.params.id);

    if (!boarding) {
      return res.status(404).json({ success: false, message: 'Boarding listing not found' });
    }

    boarding = await Boarding.findByIdAndUpdate(req.params.id, boardingData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      boarding,
    });
  } catch (error) {
    console.error('Error updating boarding:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
