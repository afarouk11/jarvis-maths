import { Topic } from '@/types'

export const AQA_TOPICS: Omit<Topic, 'id' | 'parent_id'>[] = [
  // Pure Mathematics
  { name: 'Algebra & Functions', slug: 'algebra-functions', icon: '𝑓', order_index: 1, year_group: 'AS', exam_board: null },
  { name: 'Coordinate Geometry', slug: 'coordinate-geometry', icon: '📐', order_index: 2, year_group: 'AS', exam_board: null },
  { name: 'Sequences & Series', slug: 'sequences-series', icon: '∑', order_index: 3, year_group: 'AS', exam_board: null },
  { name: 'Trigonometry', slug: 'trigonometry', icon: '△', order_index: 4, year_group: 'AS', exam_board: null },
  { name: 'Exponentials & Logarithms', slug: 'exponentials-logarithms', icon: 'eˣ', order_index: 5, year_group: 'AS', exam_board: null },
  { name: 'Differentiation', slug: 'differentiation', icon: "d/dx", order_index: 6, year_group: 'AS', exam_board: null },
  { name: 'Integration', slug: 'integration', icon: '∫', order_index: 7, year_group: 'AS', exam_board: null },
  { name: 'Vectors', slug: 'vectors', icon: '→', order_index: 8, year_group: 'AS', exam_board: null },
  { name: 'Proof', slug: 'proof', icon: '∴', order_index: 9, year_group: 'AS', exam_board: null },
  { name: 'Functions', slug: 'functions', icon: 'g∘f', order_index: 10, year_group: 'A2', exam_board: null },
  { name: 'Further Algebra', slug: 'further-algebra', icon: '∞', order_index: 11, year_group: 'A2', exam_board: null },
  { name: 'Further Calculus', slug: 'further-calculus', icon: '∂', order_index: 12, year_group: 'A2', exam_board: null },
  { name: 'Parametric Equations', slug: 'parametric-equations', icon: 'xy', order_index: 13, year_group: 'A2', exam_board: null },
  { name: 'Differential Equations', slug: 'differential-equations', icon: 'dy', order_index: 14, year_group: 'A2', exam_board: null },
  { name: 'Numerical Methods', slug: 'numerical-methods', icon: '≈', order_index: 15, year_group: 'A2', exam_board: null },
  // Statistics
  { name: 'Statistical Sampling', slug: 'statistical-sampling', icon: '📊', order_index: 16, year_group: 'AS', exam_board: null },
  { name: 'Data Presentation', slug: 'data-presentation', icon: '📈', order_index: 17, year_group: 'AS', exam_board: null },
  { name: 'Probability', slug: 'probability', icon: 'P()', order_index: 18, year_group: 'AS', exam_board: null },
  { name: 'Statistical Distributions', slug: 'statistical-distributions', icon: '~B', order_index: 19, year_group: 'AS', exam_board: null },
  { name: 'Hypothesis Testing', slug: 'hypothesis-testing', icon: 'H₀', order_index: 20, year_group: 'AS', exam_board: null },
  { name: 'Regression & Correlation', slug: 'regression-correlation', icon: '𝑟', order_index: 21, year_group: 'A2', exam_board: null },
  { name: 'Normal Distribution', slug: 'normal-distribution', icon: '~N', order_index: 22, year_group: 'A2', exam_board: null },
  // Mechanics
  { name: 'Quantities & Units', slug: 'quantities-units', icon: 'ms⁻¹', order_index: 23, year_group: 'AS', exam_board: null },
  { name: 'Kinematics', slug: 'kinematics', icon: 'v=u+at', order_index: 24, year_group: 'AS', exam_board: null },
  { name: 'Forces & Newton\'s Laws', slug: 'forces-newtons-laws', icon: 'F=ma', order_index: 25, year_group: 'AS', exam_board: null },
  { name: 'Moments', slug: 'moments', icon: 'τ', order_index: 26, year_group: 'A2', exam_board: null },
  { name: 'Projectiles', slug: 'projectiles', icon: '🎯', order_index: 27, year_group: 'A2', exam_board: null },
  { name: 'Friction', slug: 'friction', icon: 'μ', order_index: 28, year_group: 'A2', exam_board: null },
]

export const TOPIC_CATEGORIES = {
  'Pure Mathematics': ['algebra-functions', 'coordinate-geometry', 'sequences-series', 'trigonometry', 'exponentials-logarithms', 'differentiation', 'integration', 'vectors', 'proof', 'functions', 'further-algebra', 'further-calculus', 'parametric-equations', 'differential-equations', 'numerical-methods'],
  'Statistics': ['statistical-sampling', 'data-presentation', 'probability', 'statistical-distributions', 'hypothesis-testing', 'regression-correlation', 'normal-distribution'],
  'Mechanics': ['quantities-units', 'kinematics', 'forces-newtons-laws', 'moments', 'projectiles', 'friction'],
}
