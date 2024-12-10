import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

import { Box, Card } from '@mui/material';

export default function ComboBox() {
return (
    <Box
        sx={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 2,
        }}>
        <Box 
        component={Card}>    
                <Autocomplete
                disablePortal   
                options={[]}
                sx={{ width: 300 }}
                renderInput={(params) => <TextField {...params} label="Nodos" />}
                />
        </Box>
        <Box 
        component={Card}>    
                <Autocomplete
                disablePortal
                options={[]}
                sx={{ width: 300 }}
                renderInput={(params) => <TextField {...params} label="Dispositivos" />}
                />
        </Box>
    </Box>

    
);
}
