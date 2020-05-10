package example;

import org.junit.jupiter.api.Test;

/**
 *
 */
public class ErrorTest {

	@Test
	void testError() {
		throw new RuntimeException("Oops");
	}
}
