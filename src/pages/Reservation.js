import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { toast } from 'react-toastify';
import moment from 'moment';

const Reservation = () => {
  const [submitting, setSubmitting] = useState(false);

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .required('İsim alanı zorunludur')
      .min(2, 'İsim en az 2 karakter olmalıdır'),
    email: Yup.string()
      .email('Geçerli bir e-posta adresi giriniz')
      .required('E-posta alanı zorunludur'),
    phone: Yup.string()
      .required('Telefon alanı zorunludur')
      .matches(/^[0-9]+$/, 'Sadece rakam giriniz')
      .min(10, 'Telefon numarası en az 10 karakter olmalıdır'),
    date: Yup.date()
      .required('Tarih alanı zorunludur')
      .min(new Date(), 'Geçmiş bir tarih seçemezsiniz'),
    time: Yup.string()
      .required('Saat alanı zorunludur'),
    guests: Yup.number()
      .required('Kişi sayısı zorunludur')
      .min(1, 'En az 1 kişi seçmelisiniz')
      .max(10, 'En fazla 10 kişi seçebilirsiniz'),
    notes: Yup.string()
      .max(500, 'Not en fazla 500 karakter olabilir')
  });

  const handleSubmit = async (values, { resetForm }) => {
    setSubmitting(true);
    try {
      const reservationData = {
        ...values,
        createdAt: new Date(),
        status: 'pending'
      };

      await addDoc(collection(db, 'reservations'), reservationData);
      
      toast.success('Rezervasyonunuz başarıyla alındı!');
      resetForm();
    } catch (error) {
      console.error('Rezervasyon oluşturulurken hata:', error);
      toast.error('Rezervasyon oluşturulurken bir hata oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  // Müsait saatleri oluştur
  const generateTimeSlots = () => {
    const slots = [];
    const startTime = moment().set({ hour: 12, minute: 0 });
    const endTime = moment().set({ hour: 22, minute: 0 });

    while (startTime <= endTime) {
      slots.push(startTime.format('HH:mm'));
      startTime.add(30, 'minutes');
    }

    return slots;
  };

  const timeSlots = generateTimeSlots();

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <div className="reservation-form-container">
            <h1 className="text-center mb-4">Rezervasyon</h1>
            
            <Formik
              initialValues={{
                name: '',
                email: '',
                phone: '',
                date: '',
                time: '',
                guests: '',
                notes: ''
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({
                values,
                errors,
                touched,
                handleChange,
                handleBlur,
                handleSubmit,
                isValid
              }) => (
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Ad Soyad</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={values.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      isInvalid={touched.name && errors.name}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.name}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>E-posta</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={values.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      isInvalid={touched.email && errors.email}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.email}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Telefon</Form.Label>
                    <Form.Control
                      type="tel"
                      name="phone"
                      value={values.phone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      isInvalid={touched.phone && errors.phone}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.phone}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Tarih</Form.Label>
                        <Form.Control
                          type="date"
                          name="date"
                          value={values.date}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          isInvalid={touched.date && errors.date}
                          min={moment().format('YYYY-MM-DD')}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.date}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Saat</Form.Label>
                        <Form.Select
                          name="time"
                          value={values.time}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          isInvalid={touched.time && errors.time}
                        >
                          <option value="">Saat Seçin</option>
                          {timeSlots.map(time => (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          ))}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                          {errors.time}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Kişi Sayısı</Form.Label>
                    <Form.Control
                      type="number"
                      name="guests"
                      value={values.guests}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      isInvalid={touched.guests && errors.guests}
                      min="1"
                      max="10"
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.guests}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Özel Notlar</Form.Label>
                    <Form.Control
                      as="textarea"
                      name="notes"
                      value={values.notes}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      isInvalid={touched.notes && errors.notes}
                      rows={3}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.notes}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <div className="d-grid">
                    <Button
                      type="submit"
                      size="lg"
                      disabled={!isValid || submitting}
                    >
                      {submitting ? 'Gönderiliyor...' : 'Rezervasyon Yap'}
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Reservation; 