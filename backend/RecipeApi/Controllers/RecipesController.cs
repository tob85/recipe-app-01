using Microsoft.AspNetCore.Mvc;
using RecipeApi.Models;

namespace RecipeApi.Controllers;

[ApiController]
[Route("recipes")]
public class RecipesController : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<RecipeListItem>), StatusCodes.Status200OK)]
    public ActionResult<IEnumerable<RecipeListItem>> GetAll()
    {
        return Ok(Array.Empty<RecipeListItem>());
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(RecipeDetail), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult<RecipeDetail> GetById(Guid id)
    {
        return NotFound();
    }

    [HttpPost]
    [ProducesResponseType(typeof(RecipeDetail), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public ActionResult<RecipeDetail> Create([FromBody] CreateRecipeRequest request)
    {
        var recipe = new RecipeDetail
        {
            Id = Guid.Empty,
            Name = request.Name,
            Url = request.Url,
        };

        return CreatedAtAction(nameof(GetById), new { id = recipe.Id }, recipe);
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(RecipeDetail), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult<RecipeDetail> Update(Guid id, [FromBody] UpdateRecipeRequest request)
    {
        return NotFound();
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult Delete(Guid id)
    {
        return NoContent();
    }
}
