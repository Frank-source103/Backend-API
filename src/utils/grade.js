// Grade scale: A 70-100, B 60-69, C 50-59, D 45-49, F 0-44
const getGrade = (score) => {
  if (score >= 70) return "A";
  if (score >= 60) return "B";
  if (score >= 50) return "C";
  if (score >= 45) return "D";
  return "F";
};

// Grade points on a 5.0 scale
const POINTS = { A: 5, B: 4, C: 3, D: 2, F: 0 };

const getPoint = (score) => POINTS[getGrade(score)];

module.exports = { getGrade, getPoint };