
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const fsp = require('fs/promises');
const os = require('os');

const getPythonConfig = () => {
  const pythonScript = path.resolve(
    __dirname,
    '../../../data_processor/run_pipeline.py'
  );

  const venvPythonWin = path.resolve(
    __dirname,
    '../../../data_processor/.venv/Scripts/python.exe'
  );

  const venvPythonUnix = path.resolve(
    __dirname,
    '../../../data_processor/.venv/bin/python'
  );

  let pythonCmd = process.env.PYTHON_CMD || 'python';

  if (fs.existsSync(venvPythonWin)) {
    pythonCmd = venvPythonWin;
  } else if (fs.existsSync(venvPythonUnix)) {
    pythonCmd = venvPythonUnix;
  }

  if (!fs.existsSync(pythonScript)) {
    throw new Error(`Python pipeline script not found at ${pythonScript}`);
  }

  return { pythonCmd, pythonScript };
};

const executePython = (args) => {
  return new Promise((resolve, reject) => {
    let config;

    try {
      config = getPythonConfig();
    } catch (error) {
      reject(error);
      return;
    }

    const { pythonCmd, pythonScript } = config;
    const fullArgs = [pythonScript, ...args];

    console.log(
      `[PythonRunner] Spawning: ${pythonCmd} ${fullArgs.join(' ')}`
    );

    const pyProcess = spawn(pythonCmd, fullArgs);

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
        console.error(
          `[PythonRunner] Exited with code ${code}. Stderr: ${stderrData}`
        );

        reject(
          new Error(stderrData || `Python script failed with code ${code}`)
        );
        return;
      }

      try {
        resolve(JSON.parse(stdoutData.trim()));
      } catch (error) {
        console.error(
          '[PythonRunner] Failed to parse JSON stdout:',
          stdoutData
        );

        reject(
          new Error(
            `Invalid JSON output from data processing script: ${error.message}`
          )
        );
      }
    });

    pyProcess.on('error', (error) => {
      console.error(
        `[PythonRunner] Process spawn error: ${error.message}`
      );
      reject(error);
    });
  });
};

/**
 * Process an uploaded CSV or Excel file.
 */
const runPythonPipeline = (filePath, slotNumber = 1) => {
  return executePython([
    '--file',
    filePath,
    '--slot',
    String(slotNumber)
  ]);
};

/**
 * Rebuild dashboard data from all canonical MongoDB records.
 * The temporary JSON file is removed whether processing succeeds or fails.
 */
const runPythonAggregation = async (records) => {
  if (!Array.isArray(records)) {
    throw new TypeError('Python aggregation requires an array of records.');
  }

  const tempDirectory = await fsp.mkdtemp(
    path.join(os.tmpdir(), 'dojo-pulse-')
  );

  const recordsPath = path.join(tempDirectory, 'records.json');

  try {
    await fsp.writeFile(
      recordsPath,
      JSON.stringify(records),
      'utf8'
    );

    return await executePython([
      '--records-file',
      recordsPath
    ]);
  } finally {
    await fsp.rm(tempDirectory, {
      recursive: true,
      force: true
    });
  }
};

module.exports = {
  runPythonPipeline,
  runPythonAggregation
};
