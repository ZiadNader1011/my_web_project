import express from 'express';
const router = express.Router();
import * as clientController from '../controllers/clientController.js';
router.get('/', clientController.getAllClients); 

router.get('/:id', clientController.getClientDetails);
router.post('/', clientController.createClient);
router.put('/:id', clientController.updateClient);
router.delete('/:id', clientController.deleteClient);

export default router;