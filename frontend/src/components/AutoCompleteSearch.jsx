import { useState } from 'react';
import TextField from '@mui/material/TextField';
import { Box, Card } from '@mui/material';

export default function SearchBar() {
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearchQueryChange = (event) => {
        setSearchQuery(event.target.value);
    };

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <Box component={Card} sx={{ flexGrow: 1 }}>
                <TextField
                    label="Buscar todo"
                    variant="outlined"
                    fullWidth
                    value={searchQuery}
                    onChange={handleSearchQueryChange}
                />
            </Box>
        </Box>
    );
}
