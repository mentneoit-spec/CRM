import React, { useEffect, useState } from "react";
import { Box, Button, CircularProgress, Stack, TextField } from "@mui/material";
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { underControl } from '../../../redux/userRelated/userSlice';
import { BlueButton } from "../../../components/buttonStyles";
import Popup from "../../../components/Popup";
import Classroom from "../../../assets/classroom.png";
import styled from "styled-components";
import axios from 'axios';

const AddClass = () => {
    const [sclassName, setSclassName] = useState("");

    const dispatch = useDispatch()
    const navigate = useNavigate()

    const userState = useSelector(state => state.user);
    const { currentUser } = userState;

    const [loader, setLoader] = useState(false)
    const [message, setMessage] = useState("");
    const [showPopup, setShowPopup] = useState(false);

    const submitHandler = async (event) => {
        event.preventDefault()
        
        if (!sclassName.trim()) {
            setMessage("Please enter a class name")
            setShowPopup(true)
            return
        }

        setLoader(true)
        
        try {
            const token = localStorage.getItem('token')
            const response = await axios.post(
                `${process.env.REACT_APP_BASE_URL}/admin/classes`,
                { sclassName },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            )

            if (response.data.success) {
                setMessage("Class created successfully!")
                setShowPopup(true)
                setTimeout(() => {
                    navigate("/Admin/classes")
                }, 1500)
            } else {
                setMessage(response.data.message || "Failed to create class")
                setShowPopup(true)
                setLoader(false)
            }
        } catch (error) {
            console.error('Error creating class:', error)
            setMessage(error.response?.data?.message || "Error creating class")
            setShowPopup(true)
            setLoader(false)
        }
    };

    return (
        <>
            <StyledContainer>
                <StyledBox>
                    <Stack sx={{
                        alignItems: 'center',
                        mb: 3
                    }}>
                        <img
                            src={Classroom}
                            alt="classroom"
                            style={{ width: '80%' }}
                        />
                    </Stack>
                    <form onSubmit={submitHandler}>
                        <Stack spacing={3}>
                            <TextField
                                label="Create a class"
                                variant="outlined"
                                value={sclassName}
                                onChange={(event) => {
                                    setSclassName(event.target.value);
                                }}
                                required
                            />
                            <BlueButton
                                fullWidth
                                size="large"
                                sx={{ mt: 3 }}
                                variant="contained"
                                type="submit"
                                disabled={loader}
                            >
                                {loader ? <CircularProgress size={24} color="inherit" /> : "Create"}
                            </BlueButton>
                            <Button variant="outlined" onClick={() => navigate(-1)}>
                                Go Back
                            </Button>
                        </Stack>
                    </form>
                </StyledBox>
            </StyledContainer>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </>
    )
}

export default AddClass

const StyledContainer = styled(Box)`
  flex: 1 1 auto;
  align-items: center;
  display: flex;
  justify-content: center;
`;

const StyledBox = styled(Box)`
  max-width: 550px;
  padding: 50px 3rem 50px;
  margin-top: 1rem;
  background-color: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  border: 1px solid #ccc;
  border-radius: 4px;
`;