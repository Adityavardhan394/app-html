import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../hooks';
import { sendOTP, verifyOTP } from '../store/slices/authSlice';

interface FormData {
  phone: string;
  otp: string;
}

const Login: React.FC = () => {
  const [isOtpSent, setIsOtpSent] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useAppSelector(state => state.auth);

  const { register, handleSubmit, watch } = useForm<FormData>();
  const phone = watch('phone');

  const handleSendOTP = async () => {
    if (!phone || !/^\d{10}$/.test(phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    try {
      await dispatch(sendOTP(phone)).unwrap();
      setIsOtpSent(true);
      toast.success('OTP sent successfully!');
    } catch (error) {
      toast.error(error as string);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      await dispatch(verifyOTP({ phone: data.phone, otp: data.otp })).unwrap();
      toast.success('Login successful!');
      navigate('/app');
    } catch (error) {
      toast.error(error as string);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome to MediQuick
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Get medicines delivered in 10 minutes
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="phone" className="sr-only">
                Phone Number
              </label>
              <input
                {...register('phone')}
                type="tel"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Enter your phone number"
                maxLength={10}
                pattern="\d{10}"
              />
            </div>

            {isOtpSent && (
              <div>
                <label htmlFor="otp" className="sr-only">
                  OTP
                </label>
                <input
                  {...register('otp')}
                  type="text"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Enter OTP"
                  maxLength={6}
                />
              </div>
            )}
          </div>

          {!isOtpSent ? (
            <button
              type="button"
              onClick={handleSendOTP}
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {isLoading ? 'Sending OTP...' : 'Get OTP'}
            </button>
          ) : (
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {isLoading ? 'Verifying...' : 'Login'}
            </button>
          )}

          {error && (
            <p className="mt-2 text-center text-sm text-red-600">{error}</p>
          )}

          <div className="text-sm text-center">
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              New to MediQuick? Create an account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login; 