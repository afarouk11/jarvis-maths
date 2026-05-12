import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import { join } from 'path'
import { pathToFileURL } from 'url'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// ── All paper URLs ───────────────────────────────────────────────────────────

const PAPERS = [
  // ── AQA (filestore) ──────────────────────────────────────────────────────
  // 2018
  { url: 'https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2018/june/AQA-73571-QP-JUN18.PDF', title: 'AQA 2018 Paper 1 QP', board: 'AQA', year: 2018, paper: 1 },
  { url: 'https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2018/june/AQA-73571-W-MS-JUN18.PDF', title: 'AQA 2018 Paper 1 MS', board: 'AQA', year: 2018, paper: 1 },
  { url: 'https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2018/june/AQA-73572-QP-JUN18.PDF', title: 'AQA 2018 Paper 2 QP', board: 'AQA', year: 2018, paper: 2 },
  { url: 'https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2018/june/AQA-73572-W-MS-JUN18.PDF', title: 'AQA 2018 Paper 2 MS', board: 'AQA', year: 2018, paper: 2 },
  { url: 'https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2018/june/AQA-73573-QP-JUN18.PDF', title: 'AQA 2018 Paper 3 QP', board: 'AQA', year: 2018, paper: 3 },
  { url: 'https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2018/june/AQA-73573-W-MS-JUN18.PDF', title: 'AQA 2018 Paper 3 MS', board: 'AQA', year: 2018, paper: 3 },
  // 2019
  { url: 'https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2019/june/AQA-73571-QP-JUN19.PDF', title: 'AQA 2019 Paper 1 QP', board: 'AQA', year: 2019, paper: 1 },
  { url: 'https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2019/june/AQA-73571-W-MS-JUN19.PDF', title: 'AQA 2019 Paper 1 MS', board: 'AQA', year: 2019, paper: 1 },
  { url: 'https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2019/june/AQA-73572-QP-JUN19.PDF', title: 'AQA 2019 Paper 2 QP', board: 'AQA', year: 2019, paper: 2 },
  { url: 'https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2019/june/AQA-73572-W-MS-JUN19.PDF', title: 'AQA 2019 Paper 2 MS', board: 'AQA', year: 2019, paper: 2 },
  { url: 'https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2019/june/AQA-73573-QP-JUN19.PDF', title: 'AQA 2019 Paper 3 QP', board: 'AQA', year: 2019, paper: 3 },
  { url: 'https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2019/june/AQA-73573-W-MS-JUN19.PDF', title: 'AQA 2019 Paper 3 MS', board: 'AQA', year: 2019, paper: 3 },
  // 2020 November
  { url: 'https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2020/november/AQA-73571-QP-NOV20.PDF', title: 'AQA 2020 Nov Paper 1 QP', board: 'AQA', year: 2020, paper: 1 },
  { url: 'https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2020/november/AQA-73571-W-MS-NOV20.PDF', title: 'AQA 2020 Nov Paper 1 MS', board: 'AQA', year: 2020, paper: 1 },
  { url: 'https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2020/november/AQA-73572-QP-NOV20.PDF', title: 'AQA 2020 Nov Paper 2 QP', board: 'AQA', year: 2020, paper: 2 },
  { url: 'https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2020/november/AQA-73572-W-MS-NOV20.PDF', title: 'AQA 2020 Nov Paper 2 MS', board: 'AQA', year: 2020, paper: 2 },
  { url: 'https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2020/november/AQA-73573-QP-NOV20.PDF', title: 'AQA 2020 Nov Paper 3 QP', board: 'AQA', year: 2020, paper: 3 },
  { url: 'https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2020/november/AQA-73573-W-MS-NOV20.PDF', title: 'AQA 2020 Nov Paper 3 MS', board: 'AQA', year: 2020, paper: 3 },
  // 2021 November
  { url: 'https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2021/november/AQA-73571-QP-NOV21.PDF', title: 'AQA 2021 Nov Paper 1 QP', board: 'AQA', year: 2021, paper: 1 },
  { url: 'https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2021/november/AQA-73571-MS-NOV21.PDF', title: 'AQA 2021 Nov Paper 1 MS', board: 'AQA', year: 2021, paper: 1 },
  { url: 'https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2021/november/AQA-73572-QP-NOV21.PDF', title: 'AQA 2021 Nov Paper 2 QP', board: 'AQA', year: 2021, paper: 2 },
  { url: 'https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2021/november/AQA-73572-MS-NOV21.PDF', title: 'AQA 2021 Nov Paper 2 MS', board: 'AQA', year: 2021, paper: 2 },
  { url: 'https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2021/november/AQA-73573-QP-NOV21.PDF', title: 'AQA 2021 Nov Paper 3 QP', board: 'AQA', year: 2021, paper: 3 },
  { url: 'https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2021/november/AQA-73573-MS-NOV21.PDF', title: 'AQA 2021 Nov Paper 3 MS', board: 'AQA', year: 2021, paper: 3 },
  // 2022
  { url: 'https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2022/june/AQA-73571-QP-JUN22.PDF', title: 'AQA 2022 Paper 1 QP', board: 'AQA', year: 2022, paper: 1 },
  { url: 'https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2022/june/AQA-73571-MS-JUN22.PDF', title: 'AQA 2022 Paper 1 MS', board: 'AQA', year: 2022, paper: 1 },
  { url: 'https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2022/june/AQA-73572-QP-JUN22.PDF', title: 'AQA 2022 Paper 2 QP', board: 'AQA', year: 2022, paper: 2 },
  { url: 'https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2022/june/AQA-73572-MS-JUN22.PDF', title: 'AQA 2022 Paper 2 MS', board: 'AQA', year: 2022, paper: 2 },
  { url: 'https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2022/june/AQA-73573-QP-JUN22.PDF', title: 'AQA 2022 Paper 3 QP', board: 'AQA', year: 2022, paper: 3 },
  { url: 'https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2022/june/AQA-73573-MS-JUN22.PDF', title: 'AQA 2022 Paper 3 MS', board: 'AQA', year: 2022, paper: 3 },
  // 2023
  { url: 'https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2023/june/AQA-73571-QP-JUN23.PDF', title: 'AQA 2023 Paper 1 QP', board: 'AQA', year: 2023, paper: 1 },
  { url: 'https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2023/june/AQA-73571-MS-JUN23.PDF', title: 'AQA 2023 Paper 1 MS', board: 'AQA', year: 2023, paper: 1 },
  { url: 'https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2023/june/AQA-73572-QP-JUN23.PDF', title: 'AQA 2023 Paper 2 QP', board: 'AQA', year: 2023, paper: 2 },
  { url: 'https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2023/june/AQA-73572-MS-JUN23.PDF', title: 'AQA 2023 Paper 2 MS', board: 'AQA', year: 2023, paper: 2 },
  { url: 'https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2023/june/AQA-73573-QP-JUN23.PDF', title: 'AQA 2023 Paper 3 QP', board: 'AQA', year: 2023, paper: 3 },
  { url: 'https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2023/june/AQA-73573-MS-JUN23.PDF', title: 'AQA 2023 Paper 3 MS', board: 'AQA', year: 2023, paper: 3 },
  // 2024
  { url: 'https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2024/june/AQA-73571-QP-JUN24.PDF', title: 'AQA 2024 Paper 1 QP', board: 'AQA', year: 2024, paper: 1 },
  { url: 'https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2024/june/AQA-73571-MS-JUN24.PDF', title: 'AQA 2024 Paper 1 MS', board: 'AQA', year: 2024, paper: 1 },
  { url: 'https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2024/june/AQA-73572-QP-JUN24.PDF', title: 'AQA 2024 Paper 2 QP', board: 'AQA', year: 2024, paper: 2 },
  { url: 'https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2024/june/AQA-73572-MS-JUN24.PDF', title: 'AQA 2024 Paper 2 MS', board: 'AQA', year: 2024, paper: 2 },
  { url: 'https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2024/june/AQA-73573-QP-JUN24.PDF', title: 'AQA 2024 Paper 3 QP', board: 'AQA', year: 2024, paper: 3 },
  { url: 'https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2024/june/AQA-73573-MS-JUN24.PDF', title: 'AQA 2024 Paper 3 MS', board: 'AQA', year: 2024, paper: 3 },

  // ── EDEXCEL (Pearson) ─────────────────────────────────────────────────────
  // 2018
  { url: 'https://qualifications.pearson.com/content/dam/pdf/A-Level/Mathematics/2017/Exam-materials/9ma0-01-que-2018.pdf', title: 'Edexcel 2018 Paper 1 QP', board: 'Edexcel', year: 2018, paper: 1 },
  { url: 'https://qualifications.pearson.com/content/dam/pdf/A-Level/Mathematics/2017/Exam-materials/9ma0-02-que-2018.pdf', title: 'Edexcel 2018 Paper 2 QP', board: 'Edexcel', year: 2018, paper: 2 },
  { url: 'https://qualifications.pearson.com/content/dam/pdf/A-Level/Mathematics/2017/Exam-materials/9ma0-03-que-2018.pdf', title: 'Edexcel 2018 Paper 3 QP', board: 'Edexcel', year: 2018, paper: 3 },
  // PMT Edexcel
  { url: 'https://pmt.physicsandmathstutor.com/download/Maths/A-level/Papers/Edexcel/Paper-1/MS/June%202019%20MS.pdf', title: 'Edexcel 2019 Paper 1 MS', board: 'Edexcel', year: 2019, paper: 1 },
  { url: 'https://pmt.physicsandmathstutor.com/download/Maths/A-level/Papers/Edexcel/Paper-1/QP/June%202019%20QP.pdf', title: 'Edexcel 2019 Paper 1 QP', board: 'Edexcel', year: 2019, paper: 1 },
  { url: 'https://pmt.physicsandmathstutor.com/download/Maths/A-level/Papers/Edexcel/Paper-2/MS/June%202019%20MS.pdf', title: 'Edexcel 2019 Paper 2 MS', board: 'Edexcel', year: 2019, paper: 2 },
  { url: 'https://pmt.physicsandmathstutor.com/download/Maths/A-level/Papers/Edexcel/Paper-2/QP/June%202019%20QP.pdf', title: 'Edexcel 2019 Paper 2 QP', board: 'Edexcel', year: 2019, paper: 2 },
  { url: 'https://pmt.physicsandmathstutor.com/download/Maths/A-level/Papers/Edexcel/Paper-3/MS/June%202019%20MS.pdf', title: 'Edexcel 2019 Paper 3 MS', board: 'Edexcel', year: 2019, paper: 3 },
  { url: 'https://pmt.physicsandmathstutor.com/download/Maths/A-level/Papers/Edexcel/Paper-3/QP/June%202019%20QP.pdf', title: 'Edexcel 2019 Paper 3 QP', board: 'Edexcel', year: 2019, paper: 3 },
  { url: 'https://pmt.physicsandmathstutor.com/download/Maths/A-level/Papers/Edexcel/Paper-1/QP/October%202020%20QP.pdf', title: 'Edexcel Oct 2020 Paper 1 QP', board: 'Edexcel', year: 2020, paper: 1 },
  { url: 'https://pmt.physicsandmathstutor.com/download/Maths/A-level/Papers/Edexcel/Paper-1/MS/October%202020%20MS.pdf', title: 'Edexcel Oct 2020 Paper 1 MS', board: 'Edexcel', year: 2020, paper: 1 },
  { url: 'https://pmt.physicsandmathstutor.com/download/Maths/A-level/Papers/Edexcel/Paper-2/QP/October%202020%20QP.pdf', title: 'Edexcel Oct 2020 Paper 2 QP', board: 'Edexcel', year: 2020, paper: 2 },
  { url: 'https://pmt.physicsandmathstutor.com/download/Maths/A-level/Papers/Edexcel/Paper-2/MS/October%202020%20MS.pdf', title: 'Edexcel Oct 2020 Paper 2 MS', board: 'Edexcel', year: 2020, paper: 2 },
  { url: 'https://pmt.physicsandmathstutor.com/download/Maths/A-level/Papers/Edexcel/Paper-3/QP/October%202020%20QP.pdf', title: 'Edexcel Oct 2020 Paper 3 QP', board: 'Edexcel', year: 2020, paper: 3 },
  { url: 'https://pmt.physicsandmathstutor.com/download/Maths/A-level/Papers/Edexcel/Paper-3/MS/October%202020%20MS.pdf', title: 'Edexcel Oct 2020 Paper 3 MS', board: 'Edexcel', year: 2020, paper: 3 },
  { url: 'https://pmt.physicsandmathstutor.com/download/Maths/A-level/Papers/Edexcel/Paper-1/QP/October%202021%20QP.pdf', title: 'Edexcel Oct 2021 Paper 1 QP', board: 'Edexcel', year: 2021, paper: 1 },
  { url: 'https://pmt.physicsandmathstutor.com/download/Maths/A-level/Papers/Edexcel/Paper-1/MS/October%202021%20MS.pdf', title: 'Edexcel Oct 2021 Paper 1 MS', board: 'Edexcel', year: 2021, paper: 1 },
  { url: 'https://pmt.physicsandmathstutor.com/download/Maths/A-level/Papers/Edexcel/Paper-2/QP/October%202021%20QP.pdf', title: 'Edexcel Oct 2021 Paper 2 QP', board: 'Edexcel', year: 2021, paper: 2 },
  { url: 'https://pmt.physicsandmathstutor.com/download/Maths/A-level/Papers/Edexcel/Paper-2/MS/October%202021%20MS.pdf', title: 'Edexcel Oct 2021 Paper 2 MS', board: 'Edexcel', year: 2021, paper: 2 },
  { url: 'https://pmt.physicsandmathstutor.com/download/Maths/A-level/Papers/Edexcel/Paper-3/QP/October%202021%20QP.pdf', title: 'Edexcel Oct 2021 Paper 3 QP', board: 'Edexcel', year: 2021, paper: 3 },
  { url: 'https://pmt.physicsandmathstutor.com/download/Maths/A-level/Papers/Edexcel/Paper-3/MS/October%202021%20MS.pdf', title: 'Edexcel Oct 2021 Paper 3 MS', board: 'Edexcel', year: 2021, paper: 3 },
  { url: 'https://pmt.physicsandmathstutor.com/download/Maths/A-level/Papers/Edexcel/Paper-1/QP/June%202022%20QP.pdf', title: 'Edexcel 2022 Paper 1 QP', board: 'Edexcel', year: 2022, paper: 1 },
  { url: 'https://pmt.physicsandmathstutor.com/download/Maths/A-level/Papers/Edexcel/Paper-1/MS/June%202022%20MS.pdf', title: 'Edexcel 2022 Paper 1 MS', board: 'Edexcel', year: 2022, paper: 1 },
  { url: 'https://pmt.physicsandmathstutor.com/download/Maths/A-level/Papers/Edexcel/Paper-2/QP/June%202022%20QP.pdf', title: 'Edexcel 2022 Paper 2 QP', board: 'Edexcel', year: 2022, paper: 2 },
  { url: 'https://pmt.physicsandmathstutor.com/download/Maths/A-level/Papers/Edexcel/Paper-2/MS/June%202022%20MS.pdf', title: 'Edexcel 2022 Paper 2 MS', board: 'Edexcel', year: 2022, paper: 2 },
  { url: 'https://pmt.physicsandmathstutor.com/download/Maths/A-level/Papers/Edexcel/Paper-3/QP/June%202022%20QP.pdf', title: 'Edexcel 2022 Paper 3 QP', board: 'Edexcel', year: 2022, paper: 3 },
  { url: 'https://pmt.physicsandmathstutor.com/download/Maths/A-level/Papers/Edexcel/Paper-3/MS/June%202022%20MS.pdf', title: 'Edexcel 2022 Paper 3 MS', board: 'Edexcel', year: 2022, paper: 3 },
  { url: 'https://pmt.physicsandmathstutor.com/download/Maths/A-level/Papers/Edexcel/Paper-1/QP/June%202023%20QP.pdf', title: 'Edexcel 2023 Paper 1 QP', board: 'Edexcel', year: 2023, paper: 1 },
  { url: 'https://pmt.physicsandmathstutor.com/download/Maths/A-level/Papers/Edexcel/Paper-1/MS/June%202023%20MS.pdf', title: 'Edexcel 2023 Paper 1 MS', board: 'Edexcel', year: 2023, paper: 1 },
  { url: 'https://pmt.physicsandmathstutor.com/download/Maths/A-level/Papers/Edexcel/Paper-2/QP/June%202023%20QP.pdf', title: 'Edexcel 2023 Paper 2 QP', board: 'Edexcel', year: 2023, paper: 2 },
  { url: 'https://pmt.physicsandmathstutor.com/download/Maths/A-level/Papers/Edexcel/Paper-2/MS/June%202023%20MS.pdf', title: 'Edexcel 2023 Paper 2 MS', board: 'Edexcel', year: 2023, paper: 2 },
  { url: 'https://pmt.physicsandmathstutor.com/download/Maths/A-level/Papers/Edexcel/Paper-3/QP/June%202023%20QP.pdf', title: 'Edexcel 2023 Paper 3 QP', board: 'Edexcel', year: 2023, paper: 3 },
  { url: 'https://pmt.physicsandmathstutor.com/download/Maths/A-level/Papers/Edexcel/Paper-3/MS/June%202023%20MS.pdf', title: 'Edexcel 2023 Paper 3 MS', board: 'Edexcel', year: 2023, paper: 3 },
  { url: 'https://qualifications.pearson.com/content/dam/pdf/A-Level/Mathematics/2017/Exam-materials/9ma0-01-que-20240605.pdf', title: 'Edexcel 2024 Paper 1 QP', board: 'Edexcel', year: 2024, paper: 1 },
  { url: 'https://qualifications.pearson.com/content/dam/pdf/A-Level/Mathematics/2017/Exam-materials/9ma0-01-rms-20240815.pdf', title: 'Edexcel 2024 Paper 1 MS', board: 'Edexcel', year: 2024, paper: 1 },
  { url: 'https://qualifications.pearson.com/content/dam/pdf/A-Level/Mathematics/2017/Exam-materials/9ma0-02-que-20240612.pdf', title: 'Edexcel 2024 Paper 2 QP', board: 'Edexcel', year: 2024, paper: 2 },

  // ── OCR (H240) ────────────────────────────────────────────────────────────
  { url: 'https://www.ocr.org.uk/Images/535607-question-paper-pure-mathematics.pdf', title: 'OCR 2018 Paper 1 QP', board: 'OCR', year: 2018, paper: 1 },
  { url: 'https://www.ocr.org.uk/Images/535611-question-paper-pure-mathematics-and-statistics.pdf', title: 'OCR 2018 Paper 2 QP', board: 'OCR', year: 2018, paper: 2 },
  { url: 'https://www.ocr.org.uk/Images/535617-question-paper-pure-mathematics-and-mechanics.pdf', title: 'OCR 2018 Paper 3 QP', board: 'OCR', year: 2018, paper: 3 },
  { url: 'https://www.ocr.org.uk/Images/621201-question-paper-pure-mathematics-and-mechanics.pdf', title: 'OCR 2019 Paper 3 QP', board: 'OCR', year: 2019, paper: 3 },
  { url: 'https://pmt.physicsandmathstutor.com/download/Maths/A-level/Papers/OCR-A/Paper-1/QP/June%202019%20QP.pdf', title: 'OCR 2019 Paper 1 QP', board: 'OCR', year: 2019, paper: 1 },
  { url: 'https://pmt.physicsandmathstutor.com/download/Maths/A-level/Papers/OCR-A/Paper-1/MS/June%202019%20MS.pdf', title: 'OCR 2019 Paper 1 MS', board: 'OCR', year: 2019, paper: 1 },
  { url: 'https://pmt.physicsandmathstutor.com/download/Maths/A-level/Papers/OCR-A/Paper-2/QP/June%202019%20QP.pdf', title: 'OCR 2019 Paper 2 QP', board: 'OCR', year: 2019, paper: 2 },
  { url: 'https://pmt.physicsandmathstutor.com/download/Maths/A-level/Papers/OCR-A/Paper-2/MS/June%202019%20MS.pdf', title: 'OCR 2019 Paper 2 MS', board: 'OCR', year: 2019, paper: 2 },
  { url: 'https://pmt.physicsandmathstutor.com/download/Maths/A-level/Papers/OCR-A/Paper-1/QP/June%202022%20QP.pdf', title: 'OCR 2022 Paper 1 QP', board: 'OCR', year: 2022, paper: 1 },
  { url: 'https://pmt.physicsandmathstutor.com/download/Maths/A-level/Papers/OCR-A/Paper-1/MS/June%202022%20MS.pdf', title: 'OCR 2022 Paper 1 MS', board: 'OCR', year: 2022, paper: 1 },
  { url: 'https://pmt.physicsandmathstutor.com/download/Maths/A-level/Papers/OCR-A/Paper-2/QP/June%202022%20QP.pdf', title: 'OCR 2022 Paper 2 QP', board: 'OCR', year: 2022, paper: 2 },
  { url: 'https://pmt.physicsandmathstutor.com/download/Maths/A-level/Papers/OCR-A/Paper-2/MS/June%202022%20MS.pdf', title: 'OCR 2022 Paper 2 MS', board: 'OCR', year: 2022, paper: 2 },
  { url: 'https://pmt.physicsandmathstutor.com/download/Maths/A-level/Papers/OCR-A/Paper-3/QP/June%202022%20QP.pdf', title: 'OCR 2022 Paper 3 QP', board: 'OCR', year: 2022, paper: 3 },
  { url: 'https://pmt.physicsandmathstutor.com/download/Maths/A-level/Papers/OCR-A/Paper-3/MS/June%202022%20MS.pdf', title: 'OCR 2022 Paper 3 MS', board: 'OCR', year: 2022, paper: 3 },
  { url: 'https://www.ocr.org.uk/Images/703868-question-paper-pure-mathematics-and-statistics.pdf', title: 'OCR 2023 Paper 2 QP', board: 'OCR', year: 2023, paper: 2 },
  { url: 'https://www.ocr.org.uk/Images/704008-mark-scheme-pure-mathematics.pdf', title: 'OCR 2023 Paper 1 MS', board: 'OCR', year: 2023, paper: 1 },
  { url: 'https://www.ocr.org.uk/Images/704009-mark-scheme-pure-mathematics-and-statistics.pdf', title: 'OCR 2023 Paper 2 MS', board: 'OCR', year: 2023, paper: 2 },
  { url: 'https://pmt.physicsandmathstutor.com/download/Maths/A-level/Papers/OCR-A/Paper-1/QP/June%202023%20QP.pdf', title: 'OCR 2023 Paper 1 QP', board: 'OCR', year: 2023, paper: 1 },
  { url: 'https://pmt.physicsandmathstutor.com/download/Maths/A-level/Papers/OCR-A/Paper-3/QP/June%202023%20QP.pdf', title: 'OCR 2023 Paper 3 QP', board: 'OCR', year: 2023, paper: 3 },
  { url: 'https://pmt.physicsandmathstutor.com/download/Maths/A-level/Papers/OCR-A/Paper-3/MS/June%202023%20MS.pdf', title: 'OCR 2023 Paper 3 MS', board: 'OCR', year: 2023, paper: 3 },

  // ── OCR Sample Assessment Materials ──────────────────────────────────────
  { url: 'https://www.ocr.org.uk/Images/308724-unit-h240-01-pure-mathematics-sample-assessment-material.pdf', title: 'OCR Sample Paper 1 QP', board: 'OCR', year: 2017, paper: 1 },
  { url: 'https://www.ocr.org.uk/Images/308725-unit-h240-02-pure-mathematics-and-statistics-sample-assessment-material.pdf', title: 'OCR Sample Paper 2 QP', board: 'OCR', year: 2017, paper: 2 },
  { url: 'https://www.ocr.org.uk/Images/308726-unit-h240-03-pure-mathematics-and-mechanics-sample-assessment-material.pdf', title: 'OCR Sample Paper 3 QP', board: 'OCR', year: 2017, paper: 3 },
]

// ── Helpers ──────────────────────────────────────────────────────────────────

async function downloadPDF(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; StudiQ-Indexer/1.0)' },
    signal: AbortSignal.timeout(30000),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const buf = await res.arrayBuffer()
  return Buffer.from(buf)
}

async function extractText(buffer) {
  const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist/legacy/build/pdf.mjs')
  GlobalWorkerOptions.workerSrc = pathToFileURL(
    join(process.cwd(), 'node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs')
  ).href
  const pdf = await (await getDocument({ data: new Uint8Array(buffer) })).promise
  const pages = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    pages.push(content.items.map(item => item.str ?? '').join(' '))
  }
  await pdf.destroy()
  return pages.join('\n\n')
}

function chunkText(text, size = 1600, overlap = 200) {
  const chunks = []
  let i = 0
  while (i < text.length) {
    chunks.push(text.slice(i, i + size))
    i += size - overlap
  }
  return chunks.filter(c => c.trim().length > 50)
}

function guessTopicSlug(text) {
  const t = text.toLowerCase()
  const map = [
    [['differentiat', 'dy/dx', 'gradient of the curve'], 'differentiation'],
    [['integrat', 'area under', 'definite integral'], 'integration'],
    [['trigonometr', 'radian', 'cosec', 'cot ', 'sec '], 'trigonometry'],
    [['binomial', 'expansion', 'pascal'], 'binomial-expansion'],
    [['vector', 'position vector', 'scalar product'], 'vectors'],
    [['logarithm', 'ln(', 'e^x', 'exponential'], 'exponentials-logarithms'],
    [['proof by', 'contradict', 'disprove'], 'proof'],
    [['arithmetic progression', 'geometric progression', 'sum to infinity'], 'sequences-series'],
    [['quadratic', 'polynomial', 'remainder theorem', 'factor theorem'], 'algebra-functions'],
    [['probability', 'p(a', 'conditional prob'], 'probability'],
    [['normal distribution', 'z-value', 'standardise'], 'normal-distribution'],
    [['hypothesis test', 'significance level', 'critical region'], 'hypothesis-testing'],
    [['kinematics', 'suvat', 'velocity-time'], 'kinematics'],
    [['newton', 'friction', 'equilibrium', 'resultant force'], 'forces-newtons-laws'],
    [['moment', 'torque', 'pivot'], 'moments'],
  ]
  for (const [kws, slug] of map) {
    if (kws.some(k => t.includes(k))) return slug
  }
  return null
}

async function embedBatch(texts) {
  const res = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: texts.map(t => t.slice(0, 8000)),
  })
  return res.data.map(d => d.embedding)
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function alreadyUploaded(title) {
  const { data } = await supabase.from('past_papers').select('id').eq('title', title).maybeSingle()
  return !!data
}

async function upload(paper) {
  process.stdout.write(`\n[${paper.board} ${paper.year} P${paper.paper}] ${paper.title.replace(/.*\d{4} /, '')}`)

  if (await alreadyUploaded(paper.title)) {
    process.stdout.write(' — already uploaded, skipping')
    return
  }

  let buffer
  try {
    buffer = await downloadPDF(paper.url)
  } catch (e) {
    process.stdout.write(` — ✗ download failed: ${e.message}`)
    return
  }

  let text
  try {
    text = await extractText(buffer)
  } catch (e) {
    process.stdout.write(` — ✗ PDF parse error`)
    return
  }

  if (text.trim().length < 100) {
    process.stdout.write(' — ✗ image-based, skipping')
    return
  }

  const { data: rec, error: pe } = await supabase
    .from('past_papers')
    .insert({ title: paper.title, exam_board: paper.board, year: paper.year, paper_number: paper.paper })
    .select().single()

  if (pe) { process.stdout.write(` — ✗ DB: ${pe.message}`); return }

  const chunks = chunkText(text)
  let inserted = 0
  const BATCH = 20
  for (let i = 0; i < chunks.length; i += BATCH) {
    const batch = chunks.slice(i, i + BATCH)
    const embeddings = await embedBatch(batch)
    const rows = batch.map((content, j) => ({
      paper_id: rec.id, content,
      topic_slug: guessTopicSlug(content),
      page_num: Math.floor((i + j) / 3) + 1,
      embedding: embeddings[j],
    }))
    const { error } = await supabase.from('paper_chunks').insert(rows)
    if (!error) inserted += rows.length
    process.stdout.write('.')
  }

  await supabase.from('past_papers').update({ processed: true, chunk_count: inserted }).eq('id', rec.id)
  process.stdout.write(` ✓ ${inserted} chunks`)
}

async function main() {
  console.log(`Attempting ${PAPERS.length} papers across AQA, Edexcel, OCR...\n`)
  let ok = 0, skipped = 0, failed = 0
  for (const p of PAPERS) {
    try { await upload(p); ok++ } catch { failed++ }
  }
  console.log(`\n\nDone — ${ok} uploaded, ${skipped} skipped, ${failed} errors`)
}

main().catch(console.error)
