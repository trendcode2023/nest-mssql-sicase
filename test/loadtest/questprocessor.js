function logAfterResponse(req, res, context, events, done) {
  const now = new Date().toISOString();
  const latency = res.timings && res.timings.phases ? res.timings.phases.total : null;
  events.emit('counter', 'http.status.' + res.statusCode, 1);
  if (res.statusCode >= 400) {
    console.error(`[${now}] ❌ ERROR ${res.statusCode} - DNI: ${context.vars.patientDni} - Latencia: ${latency}ms`);
  } else {
    console.log(`[${now}] ✅ OK ${res.statusCode} - DNI: ${context.vars.patientDni} - Latencia: ${latency}ms`);
  }
  done();
}

module.exports = {
  logAfterResponse
};