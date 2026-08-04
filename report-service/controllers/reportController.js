import reportService from "../services/reportService.js";

export const getReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    
    const userId = req.user.id || req.user._id; 

    const report = await reportService.getReport(
      userId,
      startDate,
      endDate
    );

    res.json({
      success: true,
      data: report,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};