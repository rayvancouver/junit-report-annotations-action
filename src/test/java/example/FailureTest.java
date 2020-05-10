package example;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 *
 */
public class FailureTest {

	@Test
	void testFailure() {
		assertEquals(50, 40);
	}
}
