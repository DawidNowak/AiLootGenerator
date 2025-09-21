using System.ComponentModel.DataAnnotations;

namespace AiLootGenerator.RestApi.Tests.Unit
{
    /// <summary>
    /// Base class for model validation tests providing common validation utilities.
    /// </summary>
    public abstract class ModelValidationTestBase
    {
        /// <summary>
        /// Validates a model using the standard .NET validation framework.
        /// </summary>
        /// <param name="model">The model to validate</param>
        /// <returns>List of validation results (empty if valid)</returns>
        protected static List<ValidationResult> ValidateModel(object model)
        {
            var validationResults = new List<ValidationResult>();
            var context = new ValidationContext(model);
            Validator.TryValidateObject(model, context, validationResults, validateAllProperties: true);
            return validationResults;
        }

        /// <summary>
        /// Asserts that a model passes validation (no validation errors).
        /// </summary>
        /// <param name="model">The model to validate</param>
        protected static void AssertValidModel(object model)
        {
            var validationResults = ValidateModel(model);
            Assert.Empty(validationResults);
        }

        /// <summary>
        /// Asserts that a model fails validation for a specific property.
        /// </summary>
        /// <param name="model">The model to validate</param>
        /// <param name="propertyName">The property name that should have validation errors</param>
        /// <param name="expectedErrorMessageContains">Optional: text that should be contained in the error message</param>
        protected static void AssertInvalidProperty(object model, string propertyName, string? expectedErrorMessageContains = null)
        {
            var validationResults = ValidateModel(model);
            Assert.Contains(validationResults, v => v.MemberNames.Contains(propertyName));
            
            if (!string.IsNullOrEmpty(expectedErrorMessageContains))
            {
                Assert.Contains(validationResults, v => 
                    v.MemberNames.Contains(propertyName) && 
                    v.ErrorMessage != null && 
                    v.ErrorMessage.Contains(expectedErrorMessageContains));
            }
        }

        /// <summary>
        /// Asserts that a model fails validation for multiple properties.
        /// </summary>
        /// <param name="model">The model to validate</param>
        /// <param name="propertyNames">The property names that should have validation errors</param>
        /// <param name="minimumErrorCount">Minimum number of validation errors expected</param>
        protected static void AssertInvalidProperties(object model, string[] propertyNames, int? minimumErrorCount = null)
        {
            var validationResults = ValidateModel(model);
            
            if (minimumErrorCount.HasValue)
            {
                Assert.True(validationResults.Count >= minimumErrorCount.Value);
            }
            
            foreach (var propertyName in propertyNames)
            {
                Assert.Contains(validationResults, v => v.MemberNames.Contains(propertyName));
            }
        }
    }
}