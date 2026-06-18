import { Navigate, Route, Routes } from "react-router-dom";
import {
  ProtectedRoute,
  PlaceholderPage,
  PublicRoute,
  RoleRoute,
} from "../utils/functions";

import AuthLayout from "../layouts/AuthLayout";
import MainLayout from "../layouts/MainLayout";

import SignIn from "../views/login/SignIn";
import SignUp from "../views/login/SignUp";
import Home from "../views/home/Home";
import Rooms from "../views/rooms/Rooms";
import Reservations from "../views/reservations/Reservations";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />

      <Route
        path="/auth"
        element={
          <PublicRoute>
            <AuthLayout />
          </PublicRoute>
        }
      >
        <Route index element={<Navigate to="/auth/sign-in" replace />} />
        <Route path="sign-in" element={<SignIn />} />
        <Route path="sign-up" element={<SignUp />} />
      </Route>

      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/home" element={<Home />} />

        <Route
          path="/users"
          element={
            <RoleRoute allowedRoles={["STAFF"]}>
              <PlaceholderPage title="Users" />
            </RoleRoute>
          }
        />

        <Route
          path="/rooms"
          element={
            <RoleRoute allowedRoles={["STAFF"]}>
              <Rooms />
            </RoleRoute>
          }
        />

        <Route
          path="/reservations"
          element={
            <RoleRoute allowedRoles={["STAFF", "GUEST"]}>
              <Reservations />
            </RoleRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}
