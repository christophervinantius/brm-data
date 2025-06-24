/**
 * Time formatting utilities for race strategy planner
 */

/**
 * Convert decimal minutes to MM:SS format
 * @param {number} totalMinutes - Total minutes as decimal
 * @returns {string} Formatted time as MM:SS
 */
export const formatMinutesToMMSS = (totalMinutes) => {
  const minutes = Math.floor(totalMinutes)
  const seconds = Math.round((totalMinutes - minutes) * 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

/**
 * Convert seconds to MM:SS format
 * @param {number} totalSeconds - Total seconds
 * @returns {string} Formatted time as MM:SS
 */
export const formatSecondsToMMSS = (totalSeconds) => {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = Math.floor(totalSeconds % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

/**
 * Convert decimal minutes to H:MM:SS format
 * @param {number} totalMinutes - Total minutes as decimal
 * @returns {string} Formatted time as H:MM:SS
 */
export const formatTimeToHoursMinutesSeconds = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = Math.floor(totalMinutes % 60)
  const seconds = Math.round(((totalMinutes % 60) - minutes) * 60)
  return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

/**
 * Convert race duration to minutes based on unit
 * @param {number} duration - Duration value
 * @param {string} unit - Unit ('minutes' or 'hours')
 * @returns {number} Duration in minutes
 */
export const convertToMinutes = (duration, unit) => {
  if (unit === 'hours') {
    return duration * 60
  }
  return duration
}

/**
 * Convert lap time components to total seconds
 * @param {number} minutes - Minutes component
 * @param {number} seconds - Seconds component
 * @returns {number} Total seconds
 */
export const convertLapTimeToSeconds = (minutes, seconds) => {
  return (minutes * 60) + seconds
}

/**
 * Convert pit stop time components to total seconds
 * @param {number} minutes - Minutes component
 * @param {number} seconds - Seconds component
 * @returns {number} Total seconds
 */
export const convertPitStopTimeToSeconds = (minutes, seconds) => {
  return (minutes * 60) + seconds
}