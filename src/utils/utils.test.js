import { describe, it, expect } from 'vitest';
import { isValidUCEmail, isValidPassword } from './validators';
import { transformUserData } from './userTransforms';

describe('Validators', () => {
    it('should validate UC emails correctly', () => {
        expect(isValidUCEmail('usuario@uc.cl')).toBe(true);
        expect(isValidUCEmail('usuario@estudiante.uc.cl')).toBe(true);
        expect(isValidUCEmail('usuario@gmail.com')).toBe(false);
        expect(isValidUCEmail('usuario@uc.cl.com')).toBe(false);
    });

    it('should validate password length', () => {
        expect(isValidPassword('123456')).toBe(true);
        expect(isValidPassword('12345')).toBe(false);
    });
});

describe('User Transforms', () => {
    it('should transform user data correctly when firestore data exists', () => {
        const authUser = { uid: '123', email: 'test@uc.cl', emailVerified: true };
        const firestoreData = { nombre: 'Test User', carrera: 'Ingeniería' };

        const result = transformUserData(authUser, firestoreData);

        expect(result).toMatchObject({
            uid: '123',
            email: 'test@uc.cl',
            nombre: 'Test User',
            carrera: 'Ingeniería',
            rol: 'normal'
        });
    });

    it('should handle temporary users correctly', () => {
        const authUser = { uid: '123', email: 'test@uc.cl', emailVerified: false };

        const result = transformUserData(authUser, null);

        expect(result).toMatchObject({
            uid: '123',
            isTemporary: true,
            emailVerified: false
        });
    });
});
