import express from 'express';
import { sendSupportRequest } from '../controllers/support.controller.js';


const router = express.Router();


router.post("/", sendSupportRequest);



export default router;