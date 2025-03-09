
import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface CommandResult {
  output: string;
  error?: string;
  exitCode: number;
}

// تنفيذ أمر وإرجاع النتيجة
export function executeCommand(command: string): Promise<CommandResult> {
  return new Promise((resolve, reject) => {
    exec(command, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
      if (error && error.code !== 0) {
        reject({
          output: stdout || '',
          error: stderr || error.message,
          exitCode: error.code || 1
        });
        return;
      }

      resolve({
        output: stdout || '',
        error: stderr || '',
        exitCode: 0
      });
    });
  });
}

// تعديل ملف موجود
export function modifyFile(filePath: string, newContent: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    try {
      // التأكد من وجود المجلد
      const directory = path.dirname(filePath);
      if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
      }

      // كتابة المحتوى
      fs.writeFileSync(filePath, newContent, 'utf8');
      resolve(true);
    } catch (error) {
      console.error(`خطأ في تعديل الملف ${filePath}:`, error);
      reject(error);
    }
  });
}

// إنشاء ملف جديد
export function createFile(filePath: string, content: string): Promise<boolean> {
  return modifyFile(filePath, content);
}

// قراءة محتوى ملف
export function readFile(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      resolve(content);
    } catch (error) {
      console.error(`خطأ في قراءة الملف ${filePath}:`, error);
      reject(error);
    }
  });
}

// حذف ملف
export function deleteFile(filePath: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    try {
      fs.unlinkSync(filePath);
      resolve(true);
    } catch (error) {
      console.error(`خطأ في حذف الملف ${filePath}:`, error);
      reject(error);
    }
  });
}

// إنشاء مجلد
export function createDirectory(dirPath: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    try {
      fs.mkdirSync(dirPath, { recursive: true });
      resolve(true);
    } catch (error) {
      console.error(`خطأ في إنشاء المجلد ${dirPath}:`, error);
      reject(error);
    }
  });
}

// استعراض مجلد
export function listDirectory(dirPath: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    try {
      const files = fs.readdirSync(dirPath);
      resolve(files);
    } catch (error) {
      console.error(`خطأ في استعراض المجلد ${dirPath}:`, error);
      reject(error);
    }
  });
}
