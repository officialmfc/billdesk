import { createTheme } from '@mui/material/styles';

// Function to get CSS variable value
const getCSSVariable = (variable: string) => {
    if (typeof window === 'undefined') return '';
    return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
};

// Create MUI theme that uses Tailwind CSS variables
export const createMuiTheme = (isDark: boolean) => {
    return createTheme({
        palette: {
            mode: isDark ? 'dark' : 'light',
            primary: {
                main: isDark ? 'hsl(217, 91%, 60%)' : 'hsl(221, 83%, 53%)',
            },
            background: {
                default: isDark ? 'hsl(222, 47%, 4%)' : 'hsl(0, 0%, 100%)',
                paper: isDark ? 'hsl(222, 47%, 8%)' : 'hsl(0, 0%, 100%)',
            },
            text: {
                primary: isDark ? 'hsl(210, 40%, 98%)' : 'hsl(222, 47%, 11%)',
                secondary: isDark ? 'hsl(215, 20%, 65%)' : 'hsl(215, 16%, 47%)',
            },
        },
        components: {
            MuiTextField: {
                styleOverrides: {
                    root: {
                        '& .MuiInputBase-root': {
                            color: isDark ? 'hsl(210, 40%, 98%)' : 'hsl(222, 47%, 11%)',
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: isDark ? 'hsl(217, 33%, 17%)' : 'hsl(214, 32%, 91%)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: isDark ? 'hsl(217, 33%, 17%)' : 'hsl(214, 32%, 91%)',
                        },
                    },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        backgroundColor: isDark ? 'hsl(222, 47%, 8%)' : 'hsl(0, 0%, 100%)',
                        color: isDark ? 'hsl(210, 40%, 98%)' : 'hsl(222, 47%, 11%)',
                    },
                },
            },
        },
    });
};
