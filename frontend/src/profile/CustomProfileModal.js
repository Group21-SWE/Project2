import axios from 'axios';
import React, { useState } from 'react';
import { Modal, ModalBody, ModalFooter, Form } from 'react-bootstrap';
import ModalHeader from 'react-bootstrap/ModalHeader';
import { CONSTANTS } from '../data/Constants';

const CustomProfileModal = (props) => {
  const { profile, setProfile, setModalOpen, updateProfile } = props;
  const [data, setData] = useState(profile);
  const [error, setError] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null); // Use useState for selectedImage

  const handleSave = () => {
    if (data[CONSTANTS.PROFILE.NAME] === '') {
      setError(true);
    } else {
      // Update profile data
      axios
        .post(
          'http://localhost:5000/updateProfile',
          {
            ...data,
          },
          {
            headers: {
              userid: profile.id,
              Authorization: `Bearer ${localStorage.getItem('userId')}`,
            },
          }
        )
        .then((res) => {
          updateProfile({ ...profile, ...data });
          console.log(data);
          setModalOpen(false);
        })
        .catch((err) => {
          console.log(err.message);
          setModalOpen(false);
        });

      // Upload profile photo (if selected)
      if (selectedImage) {
        const formData = new FormData();
        formData.append('profilePhoto', selectedImage);

        axios
          .post('http://localhost:5000/profilePhoto', formData, {
            headers: {
              userid: profile.id,
              Authorization: `Bearer ${localStorage.getItem('userId')}`,
              'Content-Type': 'multipart/form-data', // Required for file uploads
            },
          })
          .then((res) => {
            console.log('Profile photo uploaded successfully');
            setModalOpen(false);
          })
          .catch((err) => {
            console.log(err.message);
            setModalOpen(false);
          });
      }
    }
  };

  return (
    <Modal show={true} centered>
      <ModalHeader>
        <h5 className='modal-title'>Edit Details</h5>
        <button
          type='button'
          className='btn-close'
          aria-label='Close'
          onClick={() => setModalOpen(false)}
        ></button>
      </ModalHeader>
      <ModalBody>
        <Form>
          <Form.Group className='mb-3'>
            <Form.Label>
              Profile Photo<span style={{ color: 'red' }}>*</span>
            </Form.Label>
            <Form.Control
              type='file'
              name='Profile photo'
              onChange={(e) => setSelectedImage(e.target.files[0])} // Update selectedImage state
            />
            {error && (
              <span style={{ color: 'red', fontSize: 12 }}>
                This field is required
              </span>
            )}
          </Form.Group>
          <Form.Group className='mb-3'>
            <Form.Label>
              Name<span style={{ color: 'red' }}>*</span>
            </Form.Label>
            <Form.Control
              type='text'
              placeholder='Enter name'
              value={data[CONSTANTS.PROFILE.NAME]}
              onChange={(e) =>
                setData({ ...data, [CONSTANTS.PROFILE.NAME]: e.target.value })
              }
            />
            {error && (
              <span style={{ color: 'red', fontSize: 12 }}>
                This field is required
              </span>
            )}
          </Form.Group>
          <Form.Group className='my-3'>
            <Form.Label>University</Form.Label>
            <Form.Control
              type='text'
              placeholder='Enter university'
              value={data[CONSTANTS.PROFILE.UNIVERSITY]}
              onChange={(e) =>
                setData({
                  ...data,
                  [CONSTANTS.PROFILE.UNIVERSITY]: e.target.value,
                })
              }
            />
          </Form.Group>
          <Form.Group className='my-3'>
            <Form.Label>Email</Form.Label>
            <Form.Control
              type='email'
              placeholder='Enter email'
              value={data[CONSTANTS.PROFILE.EMAIL]}
              onChange={(e) =>
                setData({ ...data, [CONSTANTS.PROFILE.EMAIL]: e.target.value })
              }
            />
          </Form.Group>
          <Form.Group className='my-3'>
            <Form.Label>Address</Form.Label>
            <Form.Control
              type='text'
              placeholder='Enter address'
              value={data[CONSTANTS.PROFILE.ADDRESS]}
              onChange={(e) =>
                setData({
                  ...data,
                  [CONSTANTS.PROFILE.ADDRESS]: e.target.value,
                })
              }
            />
          </Form.Group>
          <Form.Group className='my-3'>
            <Form.Label>Contact</Form.Label>
            <Form.Control
              type='text'
              placeholder='Enter contact'
              value={data[CONSTANTS.PROFILE.CONTACT]}
              onChange={(e) =>
                setData({
                  ...data,
                  [CONSTANTS.PROFILE.CONTACT]: e.target.value,
                })
              }
            />
          </Form.Group>
        </Form>
      </ModalBody>
      <ModalFooter>
        <button type='button' className='btn btn-primary' onClick={handleSave}>
          Save
        </button>
      </ModalFooter>
    </Modal>
  );
};

export default CustomProfileModal;