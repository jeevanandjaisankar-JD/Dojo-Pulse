const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * Executes the Python pandas cleaning pipeline on an uploaded CSV/Excel file.
 */
const runPythonPipeline = (filePath, slotNumber = 1) => {
  return new Promise((resolve, reject) => {
    const pythonScript = path.resolve(__dirname, '../../../data_processor/run_pipeline.py');
    const venvPythonWin = path.resolve(__dirname, '../../../data_processor/.venv/Scripts/python.exe');
    const venvPythonUnix = path.resolve(__dirname, '../../../data_processor/.venv/bin/python');

    let pythonCmd = process.env.PYTHON_CMD || 'python';
    if (fs.existsSync(venvPythonWin)) {
      pythonCmd = venvPythonWin;
    } else if (fs.existsSync(venvPythonUnix)) {
      pythonCmd = venvPythonUnix;
    }

    if (!fs.existsSync(pythonScript)) {
      return reject(new Error(`Python pipeline script not found at ${pythonScript}`));
    }

    const args = [pythonScript, '--file', filePath, '--slot', String(slotNumber)];
    console.log(`[PythonRunner] Spawning: ${pythonCmd} ${args.join(' ')}`);

    const pyProcess = spawn(pythonCmd, args);

    let stdoutData = '';
    let stderrData = '';

    pyProcess.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });

    pyProcess.stderr.on('data', (data) => {
      stderrData += data.toString();
    });

    pyProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`[PythonRunner] Exited with code ${code}. Stderr: ${stderrData}`);
        return reject(new Error(stderrData || `Python script failed with code ${code}`));
      }

      try {
        const parsed = JSON.parse(stdoutData.trim());
        resolve(parsed);
      } catch (err) {
        console.error('[PythonRunner] Failed to parse JSON stdout:', stdoutData);
        reject(new Error(`Invalid JSON output from data cleaning script: ${err.message}`));
      }
    });

    pyProcess.on('error', (err) => {
      console.error(`[PythonRunner] Process spawn error: ${err.message}`);
      reject(err);
    });
  });
};

module.exports = { runPythonPipeline };
