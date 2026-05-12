import { Topic } from '@/types'

export const GCSE_TOPICS: Omit<Topic, 'id' | 'parent_id'>[] = [
  // Number
  { name: 'Number & Place Value',       slug: 'gcse-number',           icon: '123',  order_index: 1,  year_group: 'Y10', exam_board: null },
  { name: 'Fractions',                  slug: 'gcse-fractions',        icon: '½',    order_index: 2,  year_group: 'Y10', exam_board: null },
  { name: 'Percentages',                slug: 'gcse-percentages',      icon: '%',    order_index: 3,  year_group: 'Y10', exam_board: null },
  { name: 'Ratio & Proportion',         slug: 'gcse-ratio',            icon: '∶',    order_index: 4,  year_group: 'Y10', exam_board: null },
  { name: 'Indices & Surds',            slug: 'gcse-indices-surds',    icon: '√',    order_index: 5,  year_group: 'Y11', exam_board: null },
  { name: 'Standard Form',              slug: 'gcse-standard-form',    icon: '×10ⁿ', order_index: 6,  year_group: 'Y10', exam_board: null },

  // Algebra
  { name: 'Algebraic Expressions',      slug: 'gcse-expressions',      icon: '𝑥',    order_index: 7,  year_group: 'Y10', exam_board: null },
  { name: 'Linear Equations',           slug: 'gcse-linear-equations', icon: '=',    order_index: 8,  year_group: 'Y10', exam_board: null },
  { name: 'Quadratic Equations',        slug: 'gcse-quadratics',       icon: 'x²',   order_index: 9,  year_group: 'Y11', exam_board: null },
  { name: 'Simultaneous Equations',     slug: 'gcse-simultaneous',     icon: '{}',   order_index: 10, year_group: 'Y11', exam_board: null },
  { name: 'Inequalities',               slug: 'gcse-inequalities',     icon: '<>',   order_index: 11, year_group: 'Y10', exam_board: null },
  { name: 'Sequences',                  slug: 'gcse-sequences',        icon: '…',    order_index: 12, year_group: 'Y10', exam_board: null },
  { name: 'Straight-Line Graphs',       slug: 'gcse-linear-graphs',    icon: '↗',    order_index: 13, year_group: 'Y10', exam_board: null },
  { name: 'Other Graphs & Functions',   slug: 'gcse-other-graphs',     icon: '⌒',    order_index: 14, year_group: 'Y11', exam_board: null },

  // Geometry & Measures
  { name: 'Angles & Polygons',          slug: 'gcse-angles',           icon: '∠',    order_index: 15, year_group: 'Y10', exam_board: null },
  { name: 'Circles',                    slug: 'gcse-circles',          icon: '○',    order_index: 16, year_group: 'Y10', exam_board: null },
  { name: 'Transformations',            slug: 'gcse-transformations',  icon: '↻',    order_index: 17, year_group: 'Y10', exam_board: null },
  { name: 'Area & Volume',              slug: 'gcse-area-volume',      icon: '□',    order_index: 18, year_group: 'Y10', exam_board: null },
  { name: "Pythagoras' Theorem",        slug: 'gcse-pythagoras',       icon: '△',    order_index: 19, year_group: 'Y10', exam_board: null },
  { name: 'Trigonometry',               slug: 'gcse-trigonometry',     icon: 'sin',  order_index: 20, year_group: 'Y11', exam_board: null },
  { name: 'Vectors',                    slug: 'gcse-vectors',          icon: '→',    order_index: 21, year_group: 'Y11', exam_board: null },
  { name: 'Constructions & Loci',       slug: 'gcse-constructions',    icon: '✏',    order_index: 22, year_group: 'Y10', exam_board: null },

  // Statistics & Probability
  { name: 'Statistical Measures',       slug: 'gcse-statistics',       icon: 'x̄',    order_index: 23, year_group: 'Y10', exam_board: null },
  { name: 'Charts & Diagrams',          slug: 'gcse-charts',           icon: '📊',   order_index: 24, year_group: 'Y10', exam_board: null },
  { name: 'Probability',                slug: 'gcse-probability',      icon: 'P()',  order_index: 25, year_group: 'Y10', exam_board: null },
  { name: 'Scatter Graphs',             slug: 'gcse-scatter',          icon: '∴',    order_index: 26, year_group: 'Y11', exam_board: null },
]

export const GCSE_TOPIC_CATEGORIES: Record<string, string[]> = {
  'Number': [
    'gcse-number', 'gcse-fractions', 'gcse-percentages',
    'gcse-ratio', 'gcse-indices-surds', 'gcse-standard-form',
  ],
  'Algebra': [
    'gcse-expressions', 'gcse-linear-equations', 'gcse-quadratics',
    'gcse-simultaneous', 'gcse-inequalities', 'gcse-sequences',
    'gcse-linear-graphs', 'gcse-other-graphs',
  ],
  'Geometry & Measures': [
    'gcse-angles', 'gcse-circles', 'gcse-transformations', 'gcse-area-volume',
    'gcse-pythagoras', 'gcse-trigonometry', 'gcse-vectors', 'gcse-constructions',
  ],
  'Statistics & Probability': [
    'gcse-statistics', 'gcse-charts', 'gcse-probability', 'gcse-scatter',
  ],
}
